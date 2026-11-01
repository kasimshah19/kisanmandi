# ADR 004: Online Payments Integration (Razorpay + COD Fallback) and In-App Notifications

## Status
**Accepted** (Sprint 1 - Tier 1 Core Feature Parity)

## Context
KisanMandi previously only supported Cash on Delivery (COD) and lacked milestone notifications:
1. **Payment Options:** Buyers on mobile networks frequently request UPI (Google Pay, PhonePe, Paytm), NetBanking, and Card payments for seamless purchasing. However, in rural agricultural areas or when network connectivity drops, COD must remain 100% available and reliable.
2. **Third-Party Payment Gateway Hosting & Degradation:** On free hosting (Render free tier, local development, staging), Razorpay API keys may not be configured. If payment gateway keys are missing or disabled, the application must start seamlessly, hide online payment choices from the frontend via a public configuration endpoint (`GET /api/config/public`), and fall back completely to COD.
3. **Refunds on Order Cancellation / Rejection:** When a customer cancels a pre-paid online order or a farmer rejects an order, the system must automatically initiate a refund via the payment gateway (or record it in degraded/simulated mode) and update order financial tracking (`refund_id`, `refund_amount`, `refunded_at`).
4. **Order Milestone Visibility:** Without in-app notifications, farmers do not know when a new order arrives until they manually check the incoming orders tab, and customers are not updated on delivery progression (Order Accepted, Packed, Shipped, Delivered, Cancelled, Refunded).

## Decision

### 1. Online Payment Integration (Razorpay + Graceful COD Fallback)
- **Database Schema via Flyway (`V3__online_payments.sql`):**
  - Updated `orders.payment_mode` MySQL ENUM: `('COD', 'ONLINE')`.
  - Updated `orders.payment_status` MySQL ENUM: `('PENDING', 'PAID', 'FAILED', 'REFUNDED')`.
  - Added payment tracking columns to `orders`: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `refund_id`, `refund_amount`, `refunded_at`.
- **Payment Verification & Security:**
  - Standard HMAC-SHA256 signature verification over `orderId + "|" + paymentId`.
  - **Constant-Time Comparison:** Verification uses `MessageDigest.isEqual` to prevent side-channel timing attacks.
  - Webhook verification supports `POST /api/payment/webhook` with `X-Razorpay-Signature` validation.
- **Graceful Degradation & Public Config:**
  - Exposed `GET /api/config/public` returning `{ paymentEnabled: boolean, razorpayKeyId: string }`.
  - Configurable via `app.payment.razorpay.enabled`, `app.payment.razorpay.key-id`, `app.payment.razorpay.key-secret`.
  - When disabled or keys are missing (`enabled=false`), frontend hides the Online Payment option and allows only COD.
  - If keys are set to `rzp_test_simulated` or missing in local dev, a test simulation modal allows QA testing without a live Razorpay merchant account.
- **Automated Refunds:**
  - Integrated into `OrderService.cancelOrder` (when customer cancels a paid order) and `FarmerOrderService.rejectOrder` (when farmer rejects an order).
  - Updates `Order` status to `CANCELLED` / `REJECTED`, marks `payment_status = REFUNDED`, records refund amount, and triggers a refund notification to the customer.

### 2. In-App Notifications Architecture
- **Database Schema via Flyway (`V4__notifications.sql`):**
  - Created `notifications` table: `id`, `user_id` (FK to `users(id)` with `ON DELETE CASCADE`), `title`, `message`, `type`, `reference_id`, `is_read`, `created_at`.
  - Indexes on `(user_id, is_read)` and `(user_id, created_at)` for high-speed unread queries.
- **Automated Event Triggers:**
  - **Order Placed:** Notification published to the farmer (`NEW_ORDER`).
  - **Order Status Transitions:** Notifications published to the customer for `ORDER_ACCEPTED`, `ORDER_PACKED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`, `ORDER_REJECTED`, and `ORDER_CANCELLED`.
  - **Payment & Refund Events:** Notifications published for `PAYMENT_SUCCESS` and `ORDER_REFUNDED`.
- **REST Endpoints:**
  - `GET /api/notifications` (paginated list of notifications for authenticated user).
  - `GET /api/notifications/recent` (recent 10 notifications for quick bell popover display).
  - `GET /api/notifications/unread-count` (returns `{ unreadCount: n }`).
  - `PUT /api/notifications/{id}/read` (mark single notification as read).
  - `PUT /api/notifications/read-all` (mark all notifications as read for current user).
- **Frontend Navbar Popover:**
  - Bell icon with unread count badge in header (desktop) and top bar (mobile).
  - Dropdown popover displaying recent notifications with color-coded type icons (green, blue, amber, red).
  - Direct navigation to order details upon clicking a notification.
  - "Mark all as read" button.

## Alternatives Considered
1. **Razorpay Java SDK Dependency (`razorpay-java`):**
   - *Rejected:* Heavyweight dependency with nested transient dependencies that conflict with Spring Boot 3.4 HTTP client versions and increase JAR size by ~8 MB. Direct REST integration and native HMAC-SHA256 signature calculation using `javax.crypto.Mac` requires zero external libraries, maintains minimal memory footprint for Render free tier (512 MB), and provides 100% testability.
2. **WebSocket / Server-Sent Events (SSE) for Real-Time Push:**
   - *Deferred:* WebSockets/SSE require maintaining persistent open connections on Render free instances, which exhausts file descriptors and prevents free instances from entering sleep mode when idle. Polling on route changes and user interactions provides instantaneous notification feedback with zero resource leaks.
3. **Separate Microservice for Notifications:**
   - *Rejected:* Violates the single monorepo constraint and adds unnecessary operational overhead. Database-backed notifications in MySQL provide ACID transaction safety with order status changes.

## Consequences
- **Positive:** Buyers can pay online via UPI, Cards, and NetBanking; farmers receive instant in-app alerts on new orders; customers track delivery stages and refund status clearly.
- **Positive:** 100% graceful degradation: app boots and runs without any third-party payment accounts.
- **Positive:** Full audit compliance: Flyway migrations `V3` and `V4`, H2 test profile compatibility, zero database downtime.
- **Neutral:** Adds 1 new table (`notifications`) and extends `orders` table columns.
