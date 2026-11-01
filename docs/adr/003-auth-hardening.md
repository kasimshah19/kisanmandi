# ADR 003: Auth Hardening and Account Security

## Status
**Accepted** (Sprint 1 - Tier 1 Security Audit)

## Context
During the Tier 1 security audit (`docs/TIER1-AUDIT.md`), several account security vulnerabilities and missing core workflows were identified:
1. **No Brute-Force Protection:** Attackers could execute unlimited login credential stuffing attempts without rate limiting or lockout.
2. **Missing Self-Service Recovery:** Users had no self-service password recovery if credentials were lost.
3. **Unverified Email Addresses:** Registration allowed any arbitrary email without verification of ownership.
4. **No Token Revocation:** JWT tokens remained valid until expiration even after password changes, account compromise, or user logout.
5. **User Enumeration Risk:** Auth endpoints potentially leaked account existence through differentiated error responses.
6. **Hosting Constraints:** Target hosting on Render free tier blocks outbound SMTP port 25/587 on free instances, requiring optional/graceful email degradation without breaking core flows.

## Decision

### 1. Brute-Force Lockout
- Track `failed_login_attempts` and `lockout_until` directly on the `users` entity.
- After **5 consecutive failed login attempts**, lock the account for **15 minutes**.
- Subsequent login attempts during the lockout window return HTTP 423 (Locked) with the remaining lockout duration.
- Successful login resets `failed_login_attempts` to 0 and clears `lockout_until`.

### 2. Token Versioning & Immediate Revocation
- Added `token_version INT NOT NULL DEFAULT 1` to `users`.
- Added `tokenVersion` claim to all issued JWT tokens.
- `JwtAuthFilter` checks the token's `tokenVersion` against `CustomUserDetails.tokenVersion` on every authenticated request.
- Password reset, password change, and explicit `/api/auth/logout` increment `token_version`, immediately invalidating all previously issued JWT tokens across all devices.

### 3. Secure Reset & Verification Tokens
- Generated using cryptographically secure random bytes (`SecureRandom`, 32 bytes, hex-encoded).
- **Zero Plaintext Storage:** Database stores only the SHA-256 hash (`token_hash CHAR(64)`).
- Time-bounded validity:
  - Password reset tokens expire in **1 hour**.
  - Email verification tokens expire in **24 hours**.
- Single-use guarantee (`used = false` checked and marked true in atomic transaction).
- Secure constant-time hash comparison using `MessageDigest.isEqual` to prevent side-channel timing attacks.

### 4. No User Enumeration
- `/api/auth/forgot-password` returns HTTP 200 with an identical generic confirmation message (`"If the email exists, a password reset link has been sent."`) regardless of whether the email is registered or not.

### 5. Email Service Graceful Degradation
- Configurable via `app.mail.enabled` (default `false` in local/dev).
- If mail is disabled, unconfigured, or throws connection errors, `EmailService` logs the verification/reset link safely to the server log rather than throwing exceptions or halting user actions.

### 6. Database Schema via Flyway
- Created `V2__auth_hardening.sql` containing schema adjustments and foreign keys with `ON DELETE CASCADE`.
- Existing `ADMIN` users are marked `email_verified = 1` during migration.
- `spring.jpa.hibernate.ddl-auto=validate` remains enforced in production.

## Alternatives Considered
1. **Redis Token Blacklist:**
   - *Rejected:* Requires provisioning and maintaining an external Redis instance, which exceeds the zero-cost free-tier deployment requirements. `token_version` on the user record provides $O(1)$ revocation without external infrastructure.
2. **CAPTCHA on Login:**
   - *Rejected:* Hinders accessibility and degrades UX for rural farmers on slow mobile connections. Account-level lockout with exponential backoff provides sufficient brute-force protection.
3. **OAuth2 / Social Login (Google Sign-In):**
   - *Deferred to Tier 2:* Many rural users do not have synced Google accounts; password + verified email/phone is the primary access method for Indian agricultural markets.

## Consequences
- **Positive:** Meets OWASP Authentication Verification requirements; protects user accounts against brute-force attacks and credential stuffing; revokes stolen tokens immediately upon password change or logout.
- **Positive:** Zero cost overhead on Render/Aiven; seamless degraded mode when SMTP is unavailable.
- **Neutral:** Adds 2 new database tables (`password_reset_tokens`, `email_verification_tokens`) managed via Flyway.
