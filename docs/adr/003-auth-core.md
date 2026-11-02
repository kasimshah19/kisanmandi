# ADR 003: Auth Core - Short-Lived Access Tokens, Rotating Refresh Cookies, and Account Lockout

## Status
**Accepted**

## Context
In previous sprints, KisanMandi stored long-lived JWT tokens (24 hours) directly in `localStorage` under the key `kisanmandi_token`. While functional for initial prototyping, this architecture presented significant security and operational drawbacks:
1. **XSS Vulnerability**: Tokens in `localStorage` are accessible to any JavaScript running on the page, making them vulnerable to exfiltration via Cross-Site Scripting (XSS).
2. **Lack of Token Rotation & Revocation**: Once issued, tokens could not be easily rotated without full re-authentication, and revoking a single active session without invalidating all devices was difficult.
3. **User Enumeration in Lockout**: Failed login tracking tied solely to the `users` table leaked whether an email address existed in the system (e.g. unknown emails returned 401, while existing locked accounts returned 423/429).
4. **Third-Party Cookie Degradation**: If refresh tokens are served cross-origin (e.g., frontend on `vercel.app` and backend on `onrender.com`), browsers (Safari ITP, Chrome Privacy Sandbox) block third-party `SameSite=None; Secure` cookies by default.
5. **Concurrent Tab Refresh Race Conditions**: When multiple tabs wake simultaneously after sleep, simultaneous refresh requests using strict single-use tokens would trigger false-positive token reuse detections, revoking the user's entire session family.

## Decisions

### 1. Short-Lived In-Memory Access Tokens
- **TTL**: 15 minutes (`app.jwt.expiration-ms=900000`).
- **Client Storage**: Held **exclusively in JavaScript memory** via a singleton module (`src/utils/tokenStore.js`).
- **Zero LocalStorage Persistence**: `localStorage` never stores the access token. On application launch, legacy `kisanmandi_token` keys are purged from storage.
- **JWT Claims**: Standard claims include `sub` (email), `role`, `tv` (`token_version`), `jti` (UUID), `iat`, and `exp`.

### 2. Rotating Refresh Tokens in HttpOnly Cookies
- **Format**: Cryptographically random 32 bytes (`SecureRandom`, Base64URL-encoded).
- **TTL**: 14 days (`app.auth.refresh-ttl-days=14`).
- **Database Storage**: Stored only as SHA-256 hash (`CHAR(64)` in `refresh_tokens` table). Raw tokens are never logged or stored in plaintext.
- **Cookie Flags**:
  - Name: `km_refresh`
  - `Path=/api/auth` (restricting transmission only to auth endpoints)
  - `HttpOnly=true` (inaccessible to JavaScript)
  - `SameSite=Lax`
  - `Secure`: `true` in production, `false` in local development (`app.auth.cookie-secure`).

### 3. Token Rotation, Reuse Detection & 10-Second Grace Window
- Every call to `POST /api/auth/refresh` issues a fresh access token and rotates the refresh token.
- **Reuse Detection**: Each token belongs to a `family_id` (UUID). If a previously revoked or replaced token is replayed outside the grace window, the entire family is immediately revoked, and an alert is logged (`Security event: refresh token reuse detected`).
- **Concurrent Tab Grace Period**: To prevent race conditions when multiple browser tabs wake or trigger refresh simultaneously, tokens revoked within the last **10 seconds** (`app.auth.refresh-grace-window-seconds=10`) return the newly issued active token in that family instead of triggering reuse revocation.

### 4. Same-Origin Reverse Proxy Architecture
To ensure `km_refresh` is treated as a first-party cookie and eliminate cross-origin cookie blocking:
- **Local Development**: Vite dev proxy forwards `/api/*` to `http://localhost:8080`.
- **Production (Vercel)**: `vercel.json` rewrites `/api/(.*)` to the Render backend service `https://<RENDER_HOST>/api/$1`.
- **Frontend Base URL**: Frontend uses relative `/api` paths (`VITE_API_BASE_URL=/api`), eliminating CORS preflight overhead and cross-site cookie restrictions.

### 5. CSRF & Request Integrity Protections
- Refresh requests require a custom header: `X-Requested-With: km-web`.
- In production, `Origin` / `Referer` headers are strictly validated against `app.cors.allowed-origins`.

### 6. Account Lockout without User Enumeration
- Created a separate `login_attempts` table keyed by normalized lowercase email (`email_key`).
- **Threshold**: 5 consecutive failed attempts lock the email for 15 minutes.
- **Enumeration Prevention**: Lockout logic applies equally to existing and non-existent emails. Any email with 5 failed attempts receives an identical HTTP 429 response with `Retry-After` header and `{ status: 429, message, retryAfterSeconds }`.
- Password change attempts are separately protected via an in-memory/DB lockout key (`"pw:" + userId`).

### 7. Strong Password Policy (`@StrongPassword`)
- Minimum 8 characters, maximum 72 characters (BCrypt limit).
- At least one letter and at least one digit.
- Blocklist of ~100 common passwords.
- Rejection of passwords containing the email local-part or its separated segments.
- Structured validation error codes (`PASSWORD_TOO_SHORT`, `PASSWORD_NEEDS_LETTER`, `PASSWORD_NEEDS_DIGIT`, `PASSWORD_TOO_COMMON`, `PASSWORD_CONTAINS_EMAIL`).

### 8. Trustworthy Client IP & Rate Limiting
- Configured Spring Boot Tomcat native header strategy (`server.forward-headers-strategy=native`) so `request.getRemoteAddr()` reflects the true client IP resolved from trusted upstream proxies (`X-Forwarded-For`).
- In-memory `RateLimitFilter` applies per-IP sliding window limits:
  - `POST /api/auth/login`: 10 requests / min
  - `POST /api/auth/register`: 5 requests / min
  - `POST /api/auth/refresh`: 30 requests / min
  - `PUT /api/auth/password` & `POST /api/auth/change-password`: 10 requests / min

### 9. Multi-Tab Session Synchronization
- Frontend implements `BroadcastChannel("kisanmandi_auth")` with `localStorage` storage event fallback.
- Broadcast events: `LOGIN`, `LOGOUT`, `TOKEN_REFRESH`, `SESSION_EXPIRED`.
- Logging out or changing passwords in one tab immediately updates all open tabs without full page reloads.

## Consequences

### Positive
- **Mitigated XSS Exposure**: Stealing JavaScript memory requires remote code execution within the active process; tokens cannot be extracted from offline storage.
- **Zero Third-Party Cookie Deprecation Risk**: Operating via first-party proxy rewrites ensures 100% cookie reliability across Safari, iOS WebViews, and Chrome.
- **Protection against Brute-Force & Credential Stuffing**: Rate limiting and uniform lockout eliminate automated dictionary attacks without user enumeration.
- **Session Continuity**: Multi-tab grace window prevents spurious logouts when navigating between tabs.

### Negative / Trade-Offs
- **Access Token Life**: If a user clicks "Log out" (single session), previously issued 15-minute access tokens remain valid on the backend until expiration unless `token_version` is bumped via "Log out from all devices".
- **Proxy Dependency**: The frontend depends on Vite proxy in dev and Vercel rewrites in production to communicate with the backend under the same origin.

