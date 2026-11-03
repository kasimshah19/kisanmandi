# ADR 004: Email Service (Brevo HTTPS REST API), Opaque Token Security, and Soft Email Verification

## Status
**Accepted**

## Context
1. **Outbound SMTP Blocking on Cloud PaaS**: Cloud hosting environments such as the Render free tier block outbound connections to traditional SMTP ports (25, 465, 587) to prevent spam abuse. Consequently, standard JavaMailSender/SMTP implementations fail completely.
2. **Rural Demographics & Soft Verification**: Many agricultural users and farmers in rural India rely primarily on phone numbers or do not check email regularly. Enforcing mandatory upfront email verification would cause severe onboarding friction. Email verification must therefore be soft by default (`app.auth.require-verified-email=false`), with an optional toggle for strict enforcement.
3. **Token Leakage via URLs**: Traditional password reset links include tokens in URL query parameters (`?token=...`). These query parameters are inadvertently logged in server access logs, reverse proxy logs, CDN traces, browser histories, and third-party Referer headers.
4. **User Enumeration in Recovery Flows**: Endpoints returning distinct responses or exhibiting timing disparities based on email existence allow malicious actors to enumerate registered users.
5. **Session Revocation upon Password Reset**: Resetting a forgotten password must invalidate all existing sessions, bump `token_version`, and revoke all active refresh tokens to prevent unauthorized persistent access.

---

## Decisions

### 1. Zero SMTP / Brevo HTTPS REST API
- **Transport**: Outbound emails are sent strictly via HTTPS POST to Brevo's REST API (`https://api.brevo.com/v3/smtp/email`) using Spring's non-blocking `WebClient`.
- **Authentication**: Authenticated via HTTP header `"api-key": "${BREVO_API_KEY}"`.
- **Resilience**: Configured with a 10-second request timeout and automatic retry (2 attempts with exponential backoff) applied strictly to HTTP 429 and 5xx responses.
- **Provider Fallback (`app.mail.provider`)**:
  - `brevo`: Production HTTPS delivery via Brevo. If the API key is missing, automatically falls back to `log` mode with a startup warning to prevent application crashes.
  - `log`: Development/testing mode (`LoggingEmailService`). Logs masked recipient emails and provider message IDs. Action links are logged only when `app.mail.log-links=true` in the `local` profile.
- **Zero Secret/PII Leakage**: API keys, request bodies, and raw token links are never logged.

### 2. Asynchronous, Transaction-Decoupled Email Dispatch
- **Decoupling**: Email dispatch is triggered via domain events (`SendEmailEvent`, `PasswordChangedEvent`).
- **Phase**: Handled by `@TransactionalEventListener(phase = AFTER_COMMIT, fallbackExecution = true)`. If a database transaction rolls back, no email is sent.
- **Bounded Executor**: Executed asynchronously using `@Async("mailTaskExecutor")` on a dedicated thread pool (`ThreadPoolTaskExecutor`, core 1, max 2, queue capacity 100).
- **Fault Tolerance**: Email delivery failures are captured, logged, and increment the Micrometer metric `email_sent_total{result="failure"}` without failing user HTTP requests.

### 3. Database Schema & Flyway Migration (`V6`)
- **Schema Alterations**:
  - Added `users.email_verified_at DATETIME(6) NULL`.
  - Added `users.preferred_language VARCHAR(5) NOT NULL DEFAULT 'en'`.
- **Grandfathering**:
  - Existing registered users are grandfathered as verified (`UPDATE users SET email_verified = b'1', email_verified_at = NOW() WHERE email_verified IS NULL OR email_verified = b'0'`).
- **Dedicated `user_tokens` Table**:
  - Columns: `id`, `user_id` (FK to `users.id` with `ON DELETE CASCADE`), `type ENUM('VERIFY_EMAIL', 'RESET_PASSWORD')`, `token_hash CHAR(64) UNIQUE`, `expires_at DATETIME(6)`, `used_at DATETIME(6) NULL`, `created_at DATETIME(6)`.
  - Composite index on `(user_id, type)` for fast token invalidation and lookup.

### 4. Cryptographic Opaque Tokens & Atomic Consumption
- **Entropy**: 32 cryptographically secure random bytes generated with `SecureRandom` and Base64URL-encoded (43 characters).
- **Hash-at-Rest**: Raw tokens are never stored in the database. Only SHA-256 hashes (`CHAR(64)`) are stored.
- **TTL**:
  - Email Verification tokens: 24 hours.
  - Password Reset tokens: 30 minutes.
- **Single Active Token**: Issuing a new token automatically invalidates any prior unused tokens of the same type for that user.
- **Atomic Single-Use Update**:
  ```sql
  UPDATE user_tokens
  SET used_at = :now
  WHERE token_hash = :tokenHash
    AND type = :type
    AND used_at IS NULL
    AND expires_at > :now
  ```
- **Idempotent Email Verification**: If a user clicks a verification link after already being verified, the operation succeeds gracefully with HTTP 200 without raising an error.

### 5. URL Fragment Link Security (`#token=...`)
- **Action URLs**: All emailed links place the secret token inside the URL hash fragment rather than query parameters:
  - `${APP_FRONTEND_URL}/verify-email#token=${rawToken}`
  - `${APP_FRONTEND_URL}/reset-password#token=${rawToken}`
- **Security Advantages**:
  1. URL hash fragments are client-side only and are **never transmitted to web servers** in HTTP request lines or `Referer` headers.
  2. Frontend components immediately strip the token from the browser address bar upon mount using `window.history.replaceState(null, '', window.location.pathname)`.
  3. Password reset and verification views inject `<meta name="referrer" content="no-referrer">` to guarantee zero referer leakage on any outbound navigations.

### 6. Anti-Enumeration & Multi-Tier Rate Limiting
- **Anti-Enumeration**: `POST /api/auth/forgot-password` unconditionally returns `HTTP 202 Accepted` with the response body:
  `{"message": "If that email is registered, password reset instructions have been sent."}`
- **Side-Channel Timing Protection**: For non-existent email addresses, `AuthService` performs constant-time dummy BCrypt hashing (`passwordEncoder.matches("dummyPassword", "$2a$10$...")`) to match the latency profile of authentic accounts.
- **Rate Limiting**:
  - **Email Level**: In-memory sliding window limiter restricting requests to **3 per hour per normalized email address**.
  - **IP Level**: `RateLimitFilter` restricts requests to `/api/auth/forgot-password` to **10 per minute per client IP**.
  - **Resend Verification**: Restricts resends to **1 per 60 seconds** and a maximum of **5 per 24-hour period per user**.

### 7. Soft Verification & Guard Enforcement
- **Default Behavior**: Verification is soft (`app.auth.require-verified-email=false`). Unverified users can log in, browse, search, and checkout.
- **Strict Verification Mode**: When set to `true`, unverified users attempting checkout (`OrderService.checkout`), farmer profile submission (`FarmerProfileService.saveProfile`), or product creation (`ProductService.createProduct`) receive HTTP 403:
  ```json
  {
    "status": 403,
    "error": "Forbidden",
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email address to continue."
  }
  ```
- **In-App Awareness Banner**: Unverified logged-in users are presented with a non-intrusive `EmailVerificationBanner` featuring a one-click resend button with an active 60-second cooldown countdown.

### 8. Multilingual Templates & Security Hardening
- **Language Selection**: Templates support English (`en`), Hindi (`hi`), and Marathi (`mr`). Users can update their preference via `PUT /api/auth/me/language`.
- **HTML Injection Defense**: All user inputs (such as user names) interpolated into email HTML templates are sanitized using `HtmlUtils.htmlEscape()`.
- **No Tracking**: Emails contain clean CTA buttons and raw URL fallbacks without remote tracking pixels or click redirection trackers.
- **Password Changed Notice**: Successful password resets dispatch an immediate security notification to the user's email address and revoke all active refresh tokens and in-memory access sessions across all devices.

---

## Consequences
- **Positive**:
  - Reliable email delivery on Render free tier and PaaS without SMTP port restrictions.
  - Elimination of token leakage through URL fragments and immediate browser history scrubbing.
  - Zero user enumeration across password reset workflows.
  - Frictionless onboarding for rural farmers while maintaining the ability to enforce verification when required.
  - Full multilingual support matching the core application experience.
- **Operational**:
  - Brevo API key must be provisioned in production environments.
  - In local development, action links are easily retrieved from application logs when `app.mail.log-links=true`.

