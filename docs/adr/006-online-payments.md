# ADR 006: Online Payments Core, Checkout Idempotency, and Webhook Concurrency

## Status
**Accepted**

## Context
KisanMandi connects customers directly with local farmers. Originally, the platform supported only Cash on Delivery (COD). To modernize checkout while preserving farmer protection and low-literacy clarity, online payments via Razorpay Test Mode were introduced.

Key technical and operational requirements:
1. **Multi-Farmer Checkouts**: A customer's cart often contains produce from multiple farmers. Each farmer requires an independent order with its own lifecycle (`PLACED` -> `ACCEPTED` -> `PACKED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`), invoice, and payouts. However, the customer must make **a single online payment** for their entire cart.
2. **Atomic Stock Reservation & Expiration**: Produce items must be reserved immediately upon checkout to prevent overselling, but if the customer abandons the Razorpay modal or payment fails, reserved inventory must be released within a defined window (15 minutes).
3. **Farmer Privacy & Protection**: Farmers must never see unpaid or abandoned checkout attempts. Unpaid orders must not show in farmer dashboards, pending cash calculations, or order counts.
4. **Idempotency & Network Resiliency**: Flaky mobile networks in rural/semi-urban areas can cause repeated submissions, double-clicks, or connection timeouts.
5. **Concurrent Verification & Webhooks**: The customer browser returns a payment signature immediately, while Razorpay concurrently sends an asynchronous server webhook (`payment.captured`). Both events can race.

---

## Decisions

### 1. Grouped Checkout (`payment_group_id`)
- Checkout creates **one order per farmer**, all sharing a common `payment_group_id` (format: `km_grp_<timestamp>_<uuid>`).
- A single Razorpay order is generated with the total amount of all orders combined, represented strictly in **paise** (`amount.multiply(100).setScale(0, RoundingMode.HALF_UP)`).
- The `Payment` entity references the `payment_group_id`, creating a clean 1-to-many relationship (`Payment` -> `List<Order>`).

### 2. Intermediate Order Status: `AWAITING_PAYMENT`
- Orders paid via `PaymentMode.ONLINE` start with status `AWAITING_PAYMENT`.
- Stock is decremented atomically during checkout (`UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty`).
- If payment succeeds, orders transition to `PLACED` and `OrderPlacedEvent` is published, notifying farmers via in-app notifications and email.
- **Farmer Isolation**: Farmers are completely isolated from `AWAITING_PAYMENT` orders:
  - Repositories exclude `AWAITING_PAYMENT` from farmer queries (`findByFarmerIdAndStatusNot(...)`).
  - Getting an order in `AWAITING_PAYMENT` via farmer endpoints returns `404 Not Found`.
  - Farmer stats count only COD orders in `pendingCash`.

### 3. Client Idempotency via `Idempotency-Key`
- The checkout endpoint `POST /api/customer/orders/checkout` accepts an `Idempotency-Key` HTTP header (UUID).
- The backend stores idempotency state in a dedicated table `idempotency_keys` with SHA-256 request payload fingerprints.
- **State Machine**:
  - `IN_PROGRESS`: If a concurrent duplicate arrives, returns `409 Conflict`. If in-progress key is older than 2 minutes, it is unlocked and permitted to retry.
  - `COMPLETED`: If an identical request arrives, replays the cached response with `Idempotent-Replay: true`.
  - If a duplicate key arrives with a different payload fingerprint, returns `422 Unprocessable Entity`.
  - A nightly scheduled job purges idempotency keys older than 24 hours.

### 4. Race-Free Dual Verification & Webhook Deduplication
- Both the client verification endpoint (`POST /api/customer/payments/verify`) and the webhook endpoint (`POST /api/payments/razorpay/webhook`) can confirm payment.
- Transitioning orders from `AWAITING_PAYMENT` to `PLACED` is guarded by an atomic compare-and-swap SQL statement:
  ```sql
  UPDATE orders SET status = 'PLACED' WHERE id = :id AND status = 'AWAITING_PAYMENT';
  ```
- If the client verification wins, the webhook observes 0 rows updated and skips re-publishing `OrderPlacedEvent`.
- Webhook events are tracked in `payment_events` with unique `event_id` (`x-razorpay-event-id`), preventing duplicate webhook processing.

### 5. Calm State & 15-Minute Expiration
- If the customer closes the Razorpay checkout modal or the payment fails, the frontend presents a calm state:
  *"Payment not completed. Your items are safely reserved for 15 minutes."*
- A live countdown timer shows the remaining reservation window.
- The customer can click **"Try payment again"** (calls `/api/customer/payments/{paymentGroupId}/retry`) or **"Cancel order"** (calls `/api/customer/payments/{paymentGroupId}/cancel`).
- Background job runs every 2 minutes (`paymentService.expirePendingOrders()`) to restore inventory and set uncompleted orders to `CANCELLED`.
- **Late Payment Edge Case**: If payment verification or a captured webhook arrives after the 15-minute expiration when orders were already cancelled, the payment record is marked `PAID` and orders are flagged with `refund_status = 'REQUIRED'` so administrators can reconcile and refund the customer.

### 6. Strict Test Mode Guard
- The system asserts on startup that no live keys (`rzp_live_`) are configured. If detected, application startup halts immediately with a descriptive fatal exception.

---

## Consequences

### Positive
- Zero risk of accidental real money transactions in development, testing, or demo environments.
- Reliable stock management with zero phantom inventory loss.
- High resilience to unreliable networks and double-submissions.
- Farmers are shielded from unfinished consumer checkout drop-offs.
- Seamless multi-farmer cart experience without multiple individual payment prompts.

### Negative / Trade-offs
- Inventory remains temporarily reserved for up to 15 minutes during abandoned checkouts before being returned to stock.
- Requires maintenance of webhook secrets and signature verification utilities.

