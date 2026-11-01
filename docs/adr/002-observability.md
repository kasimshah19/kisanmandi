# ADR 002: End-to-End Observability, Distributed Tracing, and Error Monitoring

## Status
Accepted

## Context
Previously, KisanMandi operated with unstructured plain-text console logging, no unique request correlation IDs, no operational telemetry or Prometheus metrics, and no crash reporting infrastructure on either the Spring Boot backend or the React frontend.

This posed several key operational and support challenges:
1. **Difficult Production Troubleshooting**: When errors occurred, logs in hosting providers (such as Render) could not be correlated across multiple simultaneous requests or with specific user sessions.
2. **PII and Secret Leakage Risk**: Without an explicit logging and error-scrubbing policy, query parameters, authorization tokens, or user details could accidentally enter log files or third-party error aggregators.
3. **Absence of Business Metrics**: There was no visibility into order placement rates, payment method distribution, order lifecycle transitions, or Gov API Mandi sync duration.
4. **Poor Support Experience for End Users**: On experiencing an unexpected error, users received generic error messages without any reference identifier to report to customer support.
5. **Hosting Constraints**: Deploying on Render's free tier (which spins down after 15 minutes of idle time) required an observability and monitoring strategy that does not abuse free resources via aggressive keep-alive polling.

## Decision
We implemented a comprehensive, privacy-first observability architecture spanning the backend and frontend:

1. **Distributed Request Tracing (`RequestIdFilter`)**:
   - Implemented an `Ordered.HIGHEST_PRECEDENCE` filter on the backend that validates incoming `X-Request-Id` headers against `^[A-Za-z0-9_-]{8,64}$` or generates a 16-character short UUID.
   - Binds `requestId` and authenticated numeric `userId` to SLF4J MDC. Strictly forbids email, phone, or name in MDC.
   - Exposes `X-Request-Id` in response headers and embeds it in every JSON error body.

2. **Profile-Aware Structured Logging**:
   - Configured Spring Boot 3.4 native structured console logging (`logging.structured.format.console=logstash`) in production (`application-prod.properties`), outputting structured single-line JSON.
   - Retained readable text logging with MDC tags in local development.
   - Emits a single access log line per request (`HTTP {method} {path} {status} ({duration}ms)`), skipping health probes and never logging request bodies, headers, or query strings.
   - Enabled Hibernate slow query logging (`hibernate.log_slow_query=300`) in production.

3. **Actuator & Micrometer Metrics**:
   - Added `spring-boot-starter-actuator` and `micrometer-registry-prometheus`.
   - Exposed `/actuator/health` and `/actuator/info` publicly with `show-details=never`.
   - Restricted `/actuator/metrics` and `/actuator/prometheus` strictly to `ROLE_ADMIN` in Spring Security.
   - Retained `/api/health` as the unauthenticated probe for Render deployment checks.
   - Implemented custom business metrics with low-cardinality tags via `AppMetricsService` (`orders_placed_total`, `order_status_changes_total`, `checkout_failures_total`, `auth_login_total`, `mandi_sync_duration`, `mandi_sync_runs_total`).

4. **Sentry Error Tracking with Privacy Scrubbers**:
   - Backend: Integrated `io.sentry:sentry-spring-boot-starter-jakarta:7.18.1` configured via `SENTRY_DSN`. Drops expected 4xx exceptions; scrubs `Authorization`, `Cookie`, query parameters, and request bodies; tags events with `requestId`.
   - Frontend: Integrated `@sentry/react:11.6.0`, lazy-loaded via dynamic import in `main.jsx` only when `VITE_SENTRY_DSN` is set. Drops expected 4xx axios errors, network drops, and ResizeObserver noise; scrubs URLs, headers, and form data.

5. **Support Reference Codes in User Interface**:
   - `axiosInstance` reads `X-Request-Id` and attaches it to errors.
   - 5xx errors trigger a custom `ReferenceToast` displaying a short 8-character reference code with a copy button.
   - `ErrorBoundary` captures unhandled React exceptions into Sentry and presents the reference code badge.
   - Fully localized across English, Hindi, and Marathi (`"Something went wrong. If it keeps happening, tell us this reference: {{id}}"`).

6. **Admin System Telemetry**:
   - Added `GET /api/admin/system` (ADMIN only) and an administrative UI page at `/admin/system` with live StatCards for server uptime, database connectivity, JVM heap memory, active profile, app version, last Mandi sync, and recent request volume.

7. **Uptime Monitoring Policy**:
   - Standard uptime monitoring is recommended for the always-on Vercel frontend.
   - Aggressive keep-alive pings against the sleeping Render backend are explicitly avoided in favor of graceful cold-start handling (UI waking banners, 60-second timeouts, and exponential retry on idempotent GET requests).

## Consequences

### Positive
- **Traceability**: End users reporting an issue provide an 8-character reference code that maps directly to logs in Render and error captures in Sentry.
- **Privacy & Security**: Zero PII (names, emails, phones) or secret tokens are leaked in logs, error payloads, or Sentry breadcrumbs.
- **Minimal Bundle Overhead**: Lazy-loading Sentry ensures the main bundle chunk increases by only ~2.7 kB uncompressed (+0.8 kB gzip).
- **Zero Impact on Disabled Sentry**: When `SENTRY_DSN` or `VITE_SENTRY_DSN` is empty, both backend and frontend continue running cleanly without exceptions.

### Neutral / Trade-offs
- Free-tier Render cold starts (~40-60s after 15 min idle) are handled gracefully via UI indicators rather than defeating the host provider's resource policies.
