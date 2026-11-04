# ADR 005: In-App Notifications, Domain Events, and Adaptive Realtime Polling

## Status
**Accepted**

## Context
KisanMandi connects farmers directly with local customers. As orders move through their lifecycle (`PLACED` -> `ACCEPTED` -> `PACKED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`), both farmers and customers require timely updates:
- **Farmers** must be promptly notified when new orders arrive, when produce stock falls low (threshold <= 5), when reviews are posted, or when products are moderated.
- **Customers** need updates on order acceptance, dispatch, and delivery.
- **Admins** require progress tracking on background Mandi price syncs.

### Deployment Environment Constraints
The production backend runs on **Render Free Tier**, and the frontend is deployed on **Vercel** via reverse proxy rewrites:
1. **15-Minute Idle Sleep**: Render free instances spin down into a sleep state after 15 minutes of inactivity.
2. **Long-Lived Connection Fragility**: Persistent WebSockets or Server-Sent Events (SSE) keep connections alive, which either artificially prevents instance spindown or terminates abruptly with broken socket exceptions when Render cycles or sleeps containers.
3. **Vercel Edge Proxy Limits**: Reverse proxying streaming WebSocket/SSE connections across Vercel rewrites imposes stream timeouts and reconnection storms.

---

## Decisions

### 1. Adaptive Client-Side Polling over WebSockets / SSE
We selected **Adaptive Polling** using a shared React hook `usePolling(callback, options)`:
- **Active Tab Awareness**: Polling completely pauses when `document.visibilityState === 'hidden'`. When the tab becomes visible or regains window focus, an immediate poll tick is executed.
- **Exponential Error Backoff**: On network failure or HTTP errors, the polling interval backs off exponentially (`interval * 2^retries`, capped at 5 minutes) to avoid flooding recovering servers.
- **In-Flight Overlap Protection**: If a server poll is taking longer than the tick interval, the subsequent tick is skipped rather than queueing overlapping requests.
- **Tuned Intervals by Domain Context**:
  - `NotificationContext`: 30s interval for global unread counter and bell badge.
  - `OrderTracking`: 15s interval while the order is in progress (`PLACED`, `ACCEPTED`, `PACKED`, `OUT_FOR_DELIVERY`), 60s otherwise; automatically disabled when the order reaches terminal status (`DELIVERED`, `CANCELLED`, `REJECTED`).
  - `FarmerOrders`: 20s interval while the farmer is reviewing incoming harvest requests, featuring a subtle "New orders received" banner when placed order counts grow.
  - `MandiSyncLogs`: 5s interval only while an admin Mandi price sync is actively running.

### 2. Decoupled Domain Events
Business services publish strongly-typed, immutable Java records through Spring's `ApplicationEventPublisher`:
- `OrderPlacedEvent(Order order)`
- `OrderStatusChangedEvent(Long orderId, Order order, OrderStatus from, OrderStatus to, String actorRole, String note)`
- `ReviewCreatedEvent(Long reviewId, Long orderId, Long farmerId, Long customerId, String customerName, int rating, String comment, Review review)`
- `FarmerApprovalChangedEvent(Long farmerId, ApprovalStatus status, String reason)`
- `ProductModeratedByAdminEvent(Long productId, Long farmerId, String productName, boolean hidden, String reason)`
- `LowStockDetectedEvent(Long productId, Long farmerId, String productName, BigDecimal remainingStock)`

Events are published **inside the same transaction** as the underlying domain mutation, preserving atomic transactional integrity.

### 3. Transactional In-App Notifications
- `NotificationService` listens to domain events using `@EventListener` within the **same transaction**. If the business operation rolls back, no notification row is persisted.
- Schema stores:
  - `title_key` and `body_key` for client-side translation via `react-i18next`.
  - `params_json` for dynamic interpolation (e.g. `orderId`, `amount`, `farmerName`).
  - `fallback_text` in English to ensure backward compatibility and reliable offline rendering.
  - `link` strictly validated against a permitted relative client route allowlist.
- Automated daily cleanup (`0 0 4 * * *`) purges read notifications older than 30 days and all notifications older than 90 days.

### 4. Asynchronous Transaction-Bound Order Emails
- Order emails (`OrderPlaced`, `OrderStatusChanged`) are listened to using:
  ```java
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Async("mailTaskExecutor")
  ```
- Emails are dispatched **only after** the database transaction successfully commits. If the transaction rolls back, no email is sent.
- Handled through `EmailService` (Brevo HTTPS REST API or dev logging), respecting verified email status and `app.mail.order-emails-enabled`.

---

## Migration Path to Server-Sent Events (SSE)
When KisanMandi scales to paid dedicated infrastructure (e.g., Render Starter/Standard or AWS ECS/Fargate) where continuous server uptime is standard:
1. **Backend**: Implement an `SseEmitter` registry in `NotificationService`, broadcasting lightweight notification IDs or event envelopes to connected user streams on domain event publication.
2. **Frontend**: Update `usePolling` or create `useSse` to connect to `GET /api/notifications/stream`. The existing `NotificationContext` will ingest incoming events directly without changing UI components (`NotificationBell`, `Notifications.jsx`, `FarmerOrders.jsx`).
3. **Resilience**: Keep the `usePolling` mechanism as a fallback when SSE disconnects or during network interruptions.

