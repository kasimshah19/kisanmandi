# KisanMandi Testing Strategy & Test Suite Guide

This document details the automated testing architecture, test coverage, and execution instructions for both the backend and frontend codebases of KisanMandi.

---

## 1. Test Architecture Overview

| Layer | Frameworks & Tools | Scope | Total Tests |
| :--- | :--- | :--- | :--- |
| **Backend** | JUnit 5, Mockito, Spring Boot Test (`@SpringBootTest`), MockMvc, JaCoCo | Unit tests for domain logic; Integration tests with in-memory H2 database; Security & RBAC verification | **80 tests** |
| **Frontend** | Vitest, React Testing Library, jsdom, i18next test harness | Component rendering, state transitions, user interactions, language switching, translation parity | **41 tests** |

---

## 2. Backend Test Suites

All backend tests reside in `kisanmandi-backend/src/test/java/com/kisanmandi/` and run without external dependencies (MySQL or Cloudinary are mocked or replaced with in-memory H2 database instances).

### 2.1 Integration Test Suites (`integration/`)
1. **`AuthFlowIntegrationTest`**:
   - Tests complete registration, login, JWT token generation, and authenticated profile access for both `ROLE_CUSTOMER` and `ROLE_FARMER`.
   - Validates that malformed email formats and short passwords are rejected with `400 Bad Request`.
2. **`RbacIntegrationTest`**:
   - Tests strict Role-Based Access Control enforcement across all three tiers:
     - Customers cannot access `/api/farmer/**` or `/api/admin/**` (returns `403 Forbidden`).
     - Farmers cannot access `/api/admin/**` or `/api/customer/**` (returns `403 Forbidden`).
     - Unauthenticated requests to protected endpoints return `401 Unauthorized`.
3. **`BlockedUserIntegrationTest`**:
   - Tests that an administrator blocking an account (`status = BLOCKED`) immediately prevents that user from authenticating or performing actions.
4. **`InternalCronIntegrationTest`**:
   - Tests the security of `/api/internal/mandi/sync`.
   - Validates that requests without an `X-Cron-Token` or with an invalid token return `403 Forbidden`.
   - Validates that a matching token returns `202 Accepted` and triggers the async sync pipeline.

### 2.2 Service & Unit Test Suites (`service/`, `security/`, `config/`)
1. **`OrderServiceTest`**:
   - Validates atomic inventory check and stock deduction when an order is placed.
   - Validates atomic stock rollback when an order is cancelled by customer or rejected by farmer.
   - Validates the order state machine and asserts that illegal status jumps (e.g. `PLACED` directly to `DELIVERED`) throw `InvalidStatusTransitionException` (`409 Conflict`).
2. **`CartServiceTest`**:
   - Validates adding items, updating quantities, verifying farmer product status, and emptying carts.
3. **`ReviewServiceTest`**:
   - Tests that reviews can only be submitted for orders with status `DELIVERED`.
   - Tests the unique constraint preventing duplicate reviews for the same order (`409 Conflict`).
   - Asserts recalculation of `ratingAvg` and `ratingCount` on `FarmerProfile`.
4. **`NearbyServiceTest`**:
   - Verifies the trigonometric Haversine spherical distance calculation.
   - Tests radius filtering (returns only farmers within the target distance).
5. **`MandiPersistenceServiceTest`**:
   - Tests bulk batch upsert logic into `mandi_prices`.
   - Validates deduplication against composite constraint `(state, district, market, commodity, variety, grade, price_date)`.
6. **`JwtUtilTest`**:
   - Tests token creation, claim extraction, role resolution, and expiration validation.
7. **`RateLimitFilterTest`**:
   - Tests sliding-window IP bucket tracking and verifies that clients receive `429 Too Many Requests` when limits are exceeded.

---

## 3. Frontend Test Suites

Frontend tests reside in `kisanmandi-frontend/src/__tests__/` and validate UI behavior in a simulated DOM environment using jsdom.

### 3.1 Internationalization & Language Switcher (`i18n.test.jsx`)
- **Key Parity**: Validates that all three language files (`en.json`, `hi.json`, `mr.json`) contain the exact same keys (447 keys).
- **Language Toggle**: Asserts that selecting Hindi or Marathi immediately updates the DOM text, writes the choice to `localStorage` under `kisanmandi_lang`, and changes `document.documentElement.lang`.
- **Interpolation & Formats**: Tests dynamic parameter replacements (e.g., price per kg, order totals) and verified date rendering across locales.

### 3.2 Automated Locale Parity Verification (`scripts/check-i18n.mjs`)
- Runs a deterministic AST check comparing translation keys across all JSON files.
- Fails the build if any key is missing or extra in Hindi or Marathi.

---

## 4. How to Run Tests Locally

### 4.1 Running Backend Tests
Execute in PowerShell from the repository root:

```powershell
# Run the entire backend test suite
cd kisanmandi-backend
.\mvnw test

# Run a specific test class
.\mvnw test -Dtest=OrderServiceTest

# Run all integration tests only
.\mvnw test -Dtest=*IntegrationTest

# Compile test sources without running tests
.\mvnw test-compile

# Generate JaCoCo code coverage report
.\mvnw test jacoco:report
# View report in: kisanmandi-backend/target/site/jacoco/index.html
```

### 4.2 Running Frontend Tests
Execute in PowerShell from the repository root:

```powershell
cd kisanmandi-frontend

# Run all frontend tests once
npm test

# Run Vitest in interactive watch mode
npm run test:watch

# Verify 100% translation key parity across EN, HI, MR
npm run i18n:check

# Run production build validation
npm run build
```

---

## 5. Continuous Integration (CI)

Every commit and pull request to the `main` branch automatically triggers the `.github/workflows/ci.yml` pipeline:
- **Backend Job**: Spins up Java 17 Temurin, caches Maven dependencies, and runs `mvn -B test`.
- **Frontend Job**: Spins up Node 20, caches npm packages, runs `npm ci`, builds the bundle (`npm run build`), and executes `npm test`.
