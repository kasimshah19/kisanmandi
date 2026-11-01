# KisanMandi Observability Guide

This document describes the observability, monitoring, logging, and tracing architecture implemented across the backend and frontend for KisanMandi.

---

## 1. Request ID Tracing (`X-Request-Id`)

Every request passing through KisanMandi is assigned a unique trace identifier:

- **Header Validation**: If incoming requests include an `X-Request-Id` header matching `^[A-Za-z0-9_-]{8,64}$`, that ID is accepted. If absent or invalid, a short 16-character UUID is generated.
- **MDC Propagation**:
  - `requestId`: Bound to SLF4J `MDC` for every request.
  - `userId`: Numeric database ID of the authenticated user (e.g. `14`). **PII (email, phone, name) is never added to MDC.**
  - MDC is cleared in a `finally` block on every request to prevent thread-pool leakage.
- **Header & Error Propagation**:
  - Returned in the `X-Request-Id` response header (exposed in CORS `Access-Control-Expose-Headers`).
  - Included in every JSON error response produced by `GlobalExceptionHandler`, `JwtAuthEntryPoint` (401), `JwtAccessDeniedHandler` (403), and `RateLimitFilter` (429).
- **Finding a Request in Render Logs**:
  - Copy the 8-character or full reference ID from the user's issue report.
  - In the Render dashboard, open the backend service and navigate to **Logs**.
  - Search for the request ID (e.g. `c42a3c67fd7649f9`). All logs associated with that request (including the access log line and any error stack traces) share the exact same `requestId` field.

---

## 2. Structured & Profile-Aware Logging

### Formats by Profile
- **Production (`application-prod.properties`)**:
  - Uses Spring Boot 3.4 native structured console logging:
    ```properties
    logging.structured.format.console=logstash
    ```
  - Outputs single-line JSON with timestamps, log levels, logger names, thread info, and MDC keys (`requestId`, `userId`).
- **Development / Local (`application.properties`)**:
  - Human-readable text format with MDC tags:
    ```properties
    logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{requestId:-}] [%X{userId:-}] %logger{36} - %msg%n
    ```

### Request Access Logging
Every HTTP request generates a single INFO log line via `RequestIdFilter`:
```
HTTP GET /api/products/12 200 (18ms)
```
- **Quiet Endpoints**: `/api/health` and `/actuator/health` are skipped from access logging to prevent noisy health check pollution.
- **PII / Secret Safety**: Query strings, request bodies, and headers (such as `Authorization` or `Cookie`) are **never** logged.

### Slow Query Logging (Production)
Configured to identify query performance bottlenecks:
```properties
spring.jpa.properties.hibernate.log_slow_query=300
```
Queries taking longer than 300ms trigger a warning log line with execution duration.

---

## 3. Actuator & Micrometer Metrics

### Endpoints
Spring Boot Actuator endpoints are hosted under `/actuator`:
- `/actuator/health`: Public, minimal status (`{"status":"UP"}`). Details hidden via `show-details=never`.
- `/actuator/info`: Public minimal application info.
- `/actuator/metrics`: Requires `ROLE_ADMIN` authentication.
- `/actuator/prometheus`: Requires `ROLE_ADMIN` authentication. Returns Prometheus-formatted metrics scrape data.
- `/api/health`: Maintained as the dedicated, unauthenticated Render service health check probe.

### Metric Tags
All metrics emitted by Micrometer are globally tagged:
- `application=kisanmandi-backend`
- `profile=${spring.profiles.active:local}`

### Custom Business Metrics
Implemented via `AppMetricsService` with low-cardinality tags:
1. `orders_placed_total{payment_mode}`: Count of orders placed by payment method (`COD`, `ONLINE`).
2. `order_status_changes_total{to}`: Count of order status lifecycle transitions (`PLACED`, `ACCEPTED`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REJECTED`).
3. `checkout_failures_total{reason}`: Count of checkout validation/stock decrement failures (`STOCK_UNAVAILABLE`, `EMPTY_CART`, `UNAUTHORIZED`).
4. `auth_login_total{result}`: Authentication attempts counter (`SUCCESS`, `BAD_CREDENTIALS`, `DISABLED`).
5. `mandi_sync_duration`: Timer recording execution duration of Gov Data.gov.in Mandi sync jobs.
6. `mandi_sync_runs_total{status}`: Count of Mandi price sync runs (`SUCCESS`, `FAILED`).
7. `email_sent_total{result}`: Counter placeholder for email delivery notifications (`SUCCESS`, `FAILED`).

---

## 4. Sentry Error Tracking

### Versions
- **Backend**: `io.sentry:sentry-spring-boot-starter-jakarta:7.18.1`
- **Frontend**: `@sentry/react:11.6.0`

### Backend Sentry Setup
- Configured through environment variables:
  - `SENTRY_DSN`: Sentry project DSN (empty string disables Sentry safely without errors).
  - `sentry.environment`: Defaults to active profile (`prod`, `local`).
  - `sentry.release`: Matches application version (`1.0.0`).
  - `sentry.send-default-pii`: `false`.
  - `sentry.traces-sample-rate`: `0.0`.
- **Scrubbing & Filtering**:
  - Drops expected 4xx exceptions: `MethodArgumentNotValidException`, `ResourceNotFoundException`, `UnauthorizedException`, `AccessDeniedException`, `BadCredentialsException`, `RateLimitExceededException`.
  - Scrubs `Authorization`, `Cookie`, and `Set-Cookie` headers.
  - Strips query strings and request bodies from Sentry events and breadcrumbs.
  - Tags every reported event with `requestId`.

### Frontend Sentry Setup
- **Lazy Loaded**: In `main.jsx`, `@sentry/react` is dynamically loaded (`await import('@sentry/react')`) only when `VITE_SENTRY_DSN` is set. This avoids inflating the initial bundle size for users.
- **Client Scrubbing**:
  - Drops expected errors: 401, 403, 404, 409, 422 axios errors, offline/network errors, and ResizeObserver browser noise.
  - Strips query strings (`?token=...`) and hash fragments (`#...`) from URLs.
  - Removes sensitive headers (`Authorization`, `Cookie`).
  - Scrubs form payload data to `[Filtered]`.
  - Tags exceptions with `requestId`.

---

## 5. User-Facing Support Reference Code

When an unexpected 5xx server error occurs:
1. `axiosInstance` extracts `X-Request-Id` from response headers or error payload and sets `error.requestId`.
2. A custom toast (`ReferenceToast`) displays a friendly message along with a short 8-character reference code (e.g. `Reference: ab12cd34`) and a copy button.
3. If an unhandled React error reaches `ErrorBoundary`, the error screen displays the reference code badge with a copy button.
4. Localized across all three supported languages:
   - English: `"Something went wrong. If it keeps happening, tell us this reference: {{id}}"`
   - Hindi: `"कुछ गलत हो गया। यदि यह बार-बार हो रहा है, तो हमें यह संदर्भ कोड बताएं: {{id}}"`
   - Marathi: `"काहीतरी त्रुटी आली. ही समस्या सतत येत असल्यास, कृपया हा संदर्भ कोड सांगा: {{id}}"`

---

## 6. Admin System Telemetry Page (`/admin/system`)

Administrators can inspect backend runtime telemetry directly in the UI under **System** in the admin sidebar:
- **Server Uptime**: Human-formatted duration (`2h 15m`).
- **Database Status**: Live connectivity state (`CONNECTED` / `DISCONNECTED`).
- **JVM Heap Memory**: Used vs Max heap in MB with utilization percentage and visual bar.
- **Active Profile & Version**: Current environment profile (`prod`, `local`) and release version.
- **Last Mandi Sync**: Timestamp, status, and record count.
- **Recent Requests**: Request volume from Micrometer counters when available.

---

## 7. Honest Uptime Monitoring Guidance

### The Hosting Architecture
- **Frontend**: Hosted on **Vercel** (always-on edge CDN).
- **Backend**: Hosted on **Render Free Tier** (spins down after 15 minutes of inactivity).
- **Database**: Hosted on **Aiven Free MySQL** (connection pool constrained).

### Recommendations & Trade-offs
1. **Monitor Vercel Frontend Frequently**:
   - Set up standard synthetic uptime checks on the frontend domain (e.g., UptimeRobot, BetterStack, or Cronitor every 1–5 minutes). The frontend is globally distributed and incurs no idle sleeping penalties.
2. **Do NOT Ping the Render Backend Frequently**:
   - **Render explicitly discourages artificial keep-alive pings** designed to prevent free-tier instances from sleeping.
   - If an automated bot pings `/api/health` every 5 or 10 minutes 24/7, Render will consume free compute hours and may suspend or throttle the service.
3. **Handle Cold Starts Gracefully Instead**:
   - KisanMandi is engineered for cold starts:
     - `ServerStatusBanner` detects slow responses (>4 seconds) and informs users that the backend is waking up.
     - `axiosInstance` uses a generous 60-second timeout for Render free tier spin-up.
     - Idempotent `GET` requests automatically retry up to 2 times with exponential backoff on 502/503/504 proxy gateway errors.
4. **Acceptable Backend Monitoring Strategy**:
   - If uptime tracking on the backend is required, configure at most **one low-frequency check (every 30 to 60 minutes)**. This verifies the service is reachable without defeating Render's resource allocation model.
