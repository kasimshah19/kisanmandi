# KisanMandi Security Architecture & Policies

This document details the security architecture, authentication model, cryptographic controls, and threat mitigation strategies implemented across KisanMandi.

---

## 1. Authentication Architecture

KisanMandi implements a hybrid stateless/stateful session architecture designed to eliminate Cross-Site Scripting (XSS) token exfiltration and withstand automated credential attacks.

```
+-------------------------------------------------------------------------------------------+
|                                    BROWSER CLIENT                                         |
|                                                                                           |
|  +-----------------------------+               +---------------------------------------+  |
|  |     JavaScript Memory       |               |           Browser Cookie Jar          |  |
|  |    (tokenStore singleton)   |               |         (Path=/api/auth, Lax)         |  |
|  |                             |               |                                       |  |
|  |    Short-Lived Access JWT   |               |          km_refresh (HttpOnly)        |  |
|  |       (TTL: 15 minutes)     |               |             (TTL: 14 days)            |  |
|  +--------------+--------------+               +-------------------+-------------------+  |
+-----------------|--------------------------------------------------|----------------------+
                  |                                                  |
     Bearer JWT   | Authorization                                    | Cookie: km_refresh
     (all API     |                                                  | (auth endpoints only)
      requests)   |                                                  |
                  v                                                  v
+-------------------------------------------------------------------------------------------+
|                                  BACKEND API GATEWAY                                      |
|                                                                                           |
|  +-----------------------------+               +---------------------------------------+  |
|  |       JwtAuthFilter         |               |             AuthService               |  |
|  |                             |               |                                       |  |
|  |  - Signature & Expiry Check |               |  - Refresh Token Rotation             |  |
|  |  - User status != BLOCKED   |               |  - Family Reuse Detection             |  |
|  |  - tokenVersion parity      |               |  - 10s Concurrent Tab Grace Window    |  |
|  +-----------------------------+               +---------------------------------------+  |
+-------------------------------------------------------------------------------------------+
```

### Access Tokens (JWT)
- **TTL**: 15 minutes (`app.jwt.expiration-ms=900000`).
- **Storage**: In-memory only via `src/utils/tokenStore.js`.
- **Zero LocalStorage Presence**: No tokens or sensitive authentication credentials are saved in `localStorage`, `sessionStorage`, or IndexedDB.
- **Claims**:
  - `sub`: User email address
  - `role`: Role authority (`ROLE_CUSTOMER`, `ROLE_FARMER`, `ROLE_ADMIN`)
  - `tv`: User's `token_version` (enables instant server-side revocation)
  - `jti`: Unique token identifier (UUID)
  - `iat` / `exp`: Issue and expiration epoch timestamps

### Refresh Tokens (`km_refresh`)
- **TTL**: 14 days (`app.auth.refresh-ttl-days=14`).
- **Entropy**: 32 cryptographically secure random bytes generated with `java.security.SecureRandom`, Base64URL-encoded.
- **Storage**: Stored only as SHA-256 hash (`token_hash CHAR(64)` in `refresh_tokens` table). Raw tokens are never logged or stored in plaintext.
- **Cookie Attributes**:
  - `Name`: `km_refresh`
  - `Path`: `/api/auth` (transmitted only on `/api/auth/refresh`, `/api/auth/logout`, etc.)
  - `HttpOnly`: `true` (prohibits access by JavaScript or XSS payloads)
  - `SameSite`: `Lax` (protects against CSRF on top-level cross-site navigations)
  - `Secure`: `true` in production (`app.auth.cookie-secure=true`), `false` in local development

### Refresh Token Rotation & Reuse Detection
- **Rotation**: Every successful refresh invocation at `POST /api/auth/refresh` revokes the old refresh token, replaces it in the database with the new token ID (`replaced_by_id`), and issues a new refresh token cookie.
- **Token Family**: Refresh tokens belong to a unique `family_id` (UUID).
- **Reuse Detection**: If a previously revoked or replaced token is replayed outside the grace window, the entire token family is immediately revoked, and a security alert is recorded (`Security event: refresh token reuse detected`).
- **10-Second Concurrent Tab Grace Window**: If a user opens or restores multiple tabs simultaneously, tabs refreshing within **10 seconds** (`app.auth.refresh-grace-window-seconds=10`) of a valid rotation receive the newly issued active token in that family rather than triggering reuse detection.

---

## 2. Password Policy (`@StrongPassword`)

KisanMandi enforces a strict password policy validated on registration, password change, and password reset:

| Rule | Specification | Error Code |
| :--- | :--- | :--- |
| **Length** | Min 8 characters, Max 72 characters (BCrypt limit) | `PASSWORD_TOO_SHORT` |
| **Letter Requirement** | At least one alphabetic character (a-z, A-Z) | `PASSWORD_NEEDS_LETTER` |
| **Digit Requirement** | At least one numeric digit (0-9) | `PASSWORD_NEEDS_DIGIT` |
| **Common Passwords** | Must not match common blocklist (~100 prevalent passwords) | `PASSWORD_TOO_COMMON` |
| **Email Separation** | Must not contain the email local-part or its separated segments | `PASSWORD_CONTAINS_EMAIL` |

### Storage & Hashing
Passwords are saved using Spring Security's `BCryptPasswordEncoder` with standard cost factor 10. Raw passwords are never logged, echoed in responses, or retained in plaintext.

---

## 3. Account Lockout & Anti-Enumeration

To prevent automated credential stuffing and dictionary attacks while eliminating user enumeration:

1. **Dedicated Attempt Tracking**: Failed attempts are recorded in `login_attempts` keyed by normalized lowercase email (`email_key`).
2. **5-Attempt Lockout**: 5 failed login attempts lock the email address for **15 minutes**.
3. **HTTP 429 Response**: Locked attempts return HTTP 429 (Too Many Requests) with `Retry-After: <seconds>` and response body:
   ```json
   {
     "timestamp": "2026-11-02T20:30:00",
     "status": 429,
     "error": "Too Many Requests",
     "message": "Too many failed attempts. Please try again after 15 minutes.",
     "retryAfterSeconds": 900,
     "requestId": "a1b2c3d4"
   }
   ```
4. **No User Enumeration**: The lockout behavior and HTTP 429 response are **100% identical** for registered users and non-existent email addresses. Attackers cannot determine whether an email is registered by probing failure responses.
5. **Password Change Protection**: `PUT /api/auth/password` is rate-limited and locked after 5 consecutive bad current password attempts per user ID (`"pw:" + userId`).

---

## 4. Trustworthy Client IP & Network Security

### Reverse Proxy & RemoteIpValve
- In production, KisanMandi runs behind reverse proxies (Render ingress, Vercel edge rewrites).
- Configured `server.forward-headers-strategy=native` in Spring Boot, activating Tomcat's native `RemoteIpValve`.
- Untrusted external headers (`X-Real-IP`, fake `X-Forwarded-For`) are validated and discarded; `request.getRemoteAddr()` returns the legitimate client IP address.

### Endpoint Rate Limiting (`RateLimitFilter`)
Sliding window in-memory rate limiting protects sensitive authentication routes:

| Endpoint | Method | Rate Limit Window | HTTP Status on Exceeded |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | 10 requests / minute | 429 + `Retry-After` |
| `/api/auth/register` | POST | 5 requests / minute | 429 + `Retry-After` |
| `/api/auth/refresh` | POST | 30 requests / minute | 429 + `Retry-After` |
| `/api/auth/password` | PUT | 10 requests / minute | 429 + `Retry-After` |
| `/api/auth/change-password` | POST | 10 requests / minute | 429 + `Retry-After` |

### CSRF Protections
- All refresh requests require `X-Requested-With: km-web`. Browsers do not send custom headers on standard cross-origin HTML form submissions without CORS approval.
- In production, `Origin` and `Referer` headers are strictly validated against `app.cors.allowed-origins`.

---

## 5. Session Revocation & Multi-Device Control

| Action | Endpoint | Behavior |
| :--- | :--- | :--- |
| **Log out (Current Device)** | `POST /api/auth/logout` | Revokes the current refresh token family; clears `km_refresh` cookie with `Max-Age=0`; returns HTTP 204. Current 15-minute access token expires naturally. |
| **Log out from All Devices** | `POST /api/auth/logout-all` | Increments `token_version` on user record; revokes ALL refresh tokens for the user; clears `km_refresh` cookie; returns HTTP 204. All access tokens on all devices become immediately invalid. |
| **Password Change** | `PUT /api/auth/password` | Increments `token_version`; revokes all previous refresh tokens; issues a fresh access token and refresh cookie for the current session. |
| **Admin Block User** | `PUT /api/admin/users/{id}/block` | Sets user status to `BLOCKED`; increments `token_version`; revokes all refresh tokens. The blocked user is instantly rejected on any subsequent request. |

---

## 6. Automated Maintenance & Cleanup

`AuthCleanupService` runs periodic maintenance jobs:
- Stale, revoked, or expired refresh tokens older than 30 days are purged nightly via `@Scheduled(cron = "0 0 3 * * *")` and on application startup.
- Expired login attempts older than 1 day are cleaned up automatically to maintain optimal table performance.

---

## 7. Email Verification & Account Recovery Security

### Cryptographic Opaque Tokens
- **Entropy**: 32 cryptographically secure random bytes generated with `java.security.SecureRandom`, encoded as Base64URL.
- **Hash-at-Rest**: Raw tokens are never stored in the database. Only SHA-256 hashes (`CHAR(64)` in `user_tokens`) are persisted.
- **Single Active Token**: Generating a new verification or reset token automatically invalidates any existing unused tokens of the same type for that user.
- **Atomic Single-Use Update**:
  Token consumption executes an atomic database update (`UPDATE user_tokens SET used_at = :now WHERE token_hash = :hash AND type = :type AND used_at IS NULL AND expires_at > :now`), preventing race conditions and token replay attacks.
- **Token Expiry**:
  - Email Verification tokens expire in **24 hours**.
  - Password Reset tokens expire in **30 minutes**.

### URL Fragment Security (`#token=...`)
- Emailed links format tokens as URL hash fragments (`/reset-password#token=...` and `/verify-email#token=...`).
- Hash fragments are client-side only and are **never transmitted across the network** in HTTP request lines, reverse proxy logs, server access logs, or `Referer` headers.
- The frontend extracts the token synchronously, cleanses the browser address bar immediately via `history.replaceState()`, and injects `<meta name="referrer" content="no-referrer">`.

### Anti-Enumeration & Side-Channel Mitigation
- `POST /api/auth/forgot-password` unconditionally returns `HTTP 202 Accepted` with an identical message for both existing and non-existing email addresses.
- To prevent timing side-channel attacks, non-existent accounts trigger a constant-time dummy BCrypt check (`passwordEncoder.matches("dummyPassword", "$2a$10$...")`).
- The endpoint is protected by dual-tier rate limiting: 3 attempts per hour per email, and 10 attempts per minute per IP address.

### Post-Reset Session Invalidation
- Resetting a password immediately increments `token_version` on the user record, revoking all existing access tokens.
- All active refresh tokens in `refresh_tokens` are revoked (`revoked_at = NOW()`), logging the user out across all devices.
- An asynchronous security notification email (`PasswordChangedEvent`) is dispatched immediately to alert the account owner.


