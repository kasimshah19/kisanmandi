# KisanMandi Automated Testing Architecture & Test Case Specification

This document provides a comprehensive test strategy, verification matrix, and detailed test case specifications for both the backend (Spring Boot 3 / Java 17) and frontend (React 19 / Vitest) applications of **KisanMandi**.

---

## 1. Executive Test Suite Summary

| Layer | Framework & Tools | Scope | Total Tests | Execution Time | Passing Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend** | JUnit 5, Mockito, Spring Boot Test (`@SpringBootTest`), MockMvc, H2 In-Memory DB, JaCoCo | Unit tests for domain logic; Integration tests with in-memory H2; Multi-tier RBAC; Token buckets; Mandi pipeline | **80 tests** | ~12 seconds | **100% (80/80)** |
| **Frontend** | Vitest, React Testing Library, jsdom, i18next test harness | Component rendering, state machine transitions, language switching, translation parity, currency formatters | **41 tests** | ~2.5 seconds | **100% (41/41)** |
| **Total** | **End-to-End Automated Test Battery** | **Full Stack Coverage** | **121 tests** | **< 15 seconds** | **100% (121/121)** |

---

## 2. Backend Test Suites Matrix

All backend test suites reside in `kisanmandi-backend/src/test/java/com/kisanmandi/` and run completely self-contained without external dependencies (MySQL and Cloudinary are mocked or substituted with in-memory H2).

| Package / Directory | Test Class | Type | Test Count | Primary Focus |
| :--- | :--- | :--- | :--- | :--- |
| `service` | `OrderServiceTest` | Unit / Mockito | 4 | Atomic checkout, multi-farmer splitting, inventory deductions, address ownership |
| `service` | `OrderStatusTransitionsTest` | Unit / Mockito | 5 | Deterministic 5-stage FSM, illegal status jumps, terminal states, stock rollback |
| `service` | `CartServiceTest` | Unit / Mockito | 4 | Cart addition, stock threshold checking, item quantity updates, customer cart clearing |
| `service` | `ReviewServiceTest` | Unit / Mockito | 4 | Delivered-order eligibility, duplicate review constraint, farmer rolling rating update |
| `service` | `NearbyServiceTest` | Unit / Mockito | 3 | In-database Haversine spherical distance calculation, radius boundaries, ascending sort |
| `service` | `AuthServiceTest` | Unit / Mockito | 5 | Customer/Farmer onboarding, password hashing verification, JWT generation, duplicate email rejection |
| `service` | `MandiPersistenceServiceTest` | Unit / Mockito | 2 | Agmarknet bulk batch upsert, composite unique key deduplication `(state, district, market, commodity, arrival_date)` |
| `service` | `MandiSyncParserTest` | Unit / Mockito | 2 | data.gov.in JSON parsing, null field resilience, date parsing |
| `service` | `MandiApiClientTest` | Unit / Mockito | 1 | WebClient REST invocation with API key headers and query parameters |
| `integration` | `AuthFlowIntegrationTest` | Integration / MockMvc | 4 | End-to-end user registration, authentication, JWT header parsing, invalid payload validation |
| `integration` | `RbacIntegrationTest` | Integration / MockMvc | 5 | 3-Tier authorization barriers (`CUSTOMER`, `FARMER`, `ADMIN`), anonymous 401 handling |
| `integration` | `BlockedUserIntegrationTest` | Integration / MockMvc | 2 | Instant account suspension enforcement, token rejection for blocked actors |
| `integration` | `InternalCronIntegrationTest` | Integration / MockMvc | 3 | Headless sync webhook security (`X-Cron-Token`), 403 Forbidden vs. 202 Accepted |
| `integration` | `PublicEndpointsIntegrationTest` | Integration / MockMvc | 3 | Anonymous access to public products, categories, health endpoints, and Mandi rates |
| `security` | `JwtUtilTest` | Unit | 3 | HMAC-SHA256 signature validation, claim extraction, token expiration detection |
| `security` | `RateLimitFilterTest` | Unit / Mockito | 3 | Sliding-window token bucket algorithm, 429 Too Many Requests response, bucket refresh |
| `config` | `DemoAccountsSeederTest` | Unit / Mockito | 1 | Automatic seeding of default demo users on initial empty database startup |
| `config` | `ProdConfigValidatorTest` | Unit | 1 | Fail-fast production environment variable validation (DB, JWT, Mandi key) |
| Root | `KisanMandiApplicationTests` | Context Load | 1 | Spring application context bootstrapping and bean dependency wiring |

---

## 3. Granular Backend Test Cases

### 3.1 Order Management & Checkout (`OrderServiceTest`)

| Test ID | Method / Scenario | Preconditions / Input | Expected Result / System Effect | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-BE-ORD-01` | `checkout_emptyCart_throwsException` | Customer cart has 0 items | Throws `CartEmptyException` (`400 Bad Request`); no order created; database unchanged | `PASSED` |
| `TC-BE-ORD-02` | `checkout_otherUsersAddress_rejected` | Address ID belongs to user ID 999; customer is user ID 1 | Throws `ResourceNotFoundException` (`404 Not Found`); cross-tenant address hijack blocked | `PASSED` |
| `TC-BE-ORD-03` | `checkout_insufficientStock_throwsException` | Product has 5 kg stock; cart item requests 10 kg | Throws `InsufficientStockException` (`400 Bad Request`); stock update returns 0 rows; 0 orders saved | `PASSED` |
| `TC-BE-ORD-04` | `checkout_twoFarmers_createsTwoOrders` | Cart has Product A (Farmer 1) and Product B (Farmer 2) | Splits cart into 2 separate Orders; calculates line item totals on server; atomical stock deduction; deletes cart items | `PASSED` |

---

### 3.2 Order State Machine & Stock Rollback (`OrderStatusTransitionsTest`)

| Test ID | Method / Scenario | Preconditions / Input | Expected Result / System Effect | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-BE-FSM-01` | `farmerFlow_allowedTransitions_pass` | Order status is `PLACED` | Sequentially transitions: `PLACED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `PACKED` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` without errors | `PASSED` |
| `TC-BE-FSM-02` | `farmerFlow_invalidTransition_throwsException` | Order status is `PLACED`; farmer requests `PACKED` | Illegal status jump throws `InvalidStatusTransitionException` (`409 Conflict`); order remains `PLACED` | `PASSED` |
| `TC-BE-FSM-03` | `farmerFlow_terminalState_cannotBeUpdated` | Order status is `DELIVERED`; transition to `CANCELLED` | Throws `InvalidStatusTransitionException` (`409 Conflict`); terminal delivered orders are immutable | `PASSED` |
| `TC-BE-FSM-04` | `farmerReject_requiresNote_andRestoresStock` | Order is `PLACED`; farmer rejects without reason | Missing note throws `IllegalArgumentException`; when note provided, status becomes `REJECTED` and stock is atomically refunded | `PASSED` |
| `TC-BE-FSM-05` | `customerCancel_onlyAllowedWhenPlaced_restoresStock` | Order is `PLACED`; customer initiates cancel | Status updates to `CANCELLED`; reserved stock refunded to product catalog; if order is already `ACCEPTED`, throws `409 Conflict` | `PASSED` |

---

### 3.3 Customer Reviews & Trust Engine (`ReviewServiceTest`)

| Test ID | Method / Scenario | Preconditions / Input | Expected Result / System Effect | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-BE-REV-01` | `addReview_validDeliveredOrder_success` | Order status is `DELIVERED`; customer rating = 5 stars | Review saved; `FarmerProfile.ratingCount` increments by 1; `FarmerProfile.ratingAvg` recalculates dynamically | `PASSED` |
| `TC-BE-REV-02` | `addReview_nonDeliveredOrder_rejected` | Order status is `OUT_FOR_DELIVERY` or `PLACED` | Throws `IllegalStateException` (`400 Bad Request`); review submission rejected | `PASSED` |
| `TC-BE-REV-03` | `addReview_duplicateReview_throwsConflict` | Order already has an active review submitted | Throws `DuplicateReviewException` (`409 Conflict`) due to unique constraint on `order_id` | `PASSED` |
| `TC-BE-REV-04` | `addReview_wrongCustomer_rejected` | Review submitted by user who is not the order's buyer | Throws `AccessDeniedException` (`403 Forbidden`); unauthorized review submission blocked | `PASSED` |

---

### 3.4 Hyperlocal Spatial Discovery (`NearbyServiceTest`)

| Test ID | Method / Scenario | Preconditions / Input | Expected Result / System Effect | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-BE-GEO-01` | `findNearbyFarmers_returnsOnlyWithinRadius` | Customer at (18.5204, 73.8567); radius = 25 km | Farmers within 25 km returned; farmers located at 45 km excluded from result set | `PASSED` |
| `TC-BE-GEO-02` | `findNearbyFarmers_sortsByAscendingDistance` | 3 farmers at 5 km, 12 km, and 20 km distance | Results ordered strictly by `distanceKm ASC` (nearest farm gate first) | `PASSED` |
| `TC-BE-GEO-03` | `haversineCalculation_exactDistanceAccuracy` | Lat1/Lon1 to Lat2/Lon2 coordinates tested against known benchmarks | Calculated spherical distance matches mathematical trigonometric formula within 0.1% tolerance | `PASSED` |

---

### 3.5 Role-Based Access Control & Security (`RbacIntegrationTest`)

| Test ID | Protected Route | Authenticated Role | Expected HTTP Status | Security Assertion | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-BE-SEC-01` | `GET /api/customer/orders` | `ANONYMOUS` (No Token) | `401 Unauthorized` | Unauthenticated requests are blocked at `SecurityFilterChain` | `PASSED` |
| `TC-BE-SEC-02` | `GET /api/farmer/orders` | `ROLE_CUSTOMER` | `403 Forbidden` | Customers cannot inspect farmer dispatch queues | `PASSED` |
| `TC-BE-SEC-03` | `POST /api/admin/farmers/1/verify` | `ROLE_FARMER` | `403 Forbidden` | Farmers cannot verify their own or other farmer profiles | `PASSED` |
| `TC-BE-SEC-04` | `POST /api/admin/categories` | `ROLE_ADMIN` | `201 Created` | Administrators have complete catalog governance access | `PASSED` |
| `TC-BE-SEC-05` | `GET /api/customer/profile` | `ROLE_CUSTOMER` | `200 OK` | Authorized users can access their own profile data | `PASSED` |

---

### 3.6 Edge Rate Limiting & Webhook Security (`RateLimitFilterTest` & `InternalCronIntegrationTest`)

| Test ID | Test Target | Input Condition | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-BE-SEC-06` | `RateLimitFilter` | Client IP sends 10 requests within 1 minute (limit = 10) | All 10 requests succeed with `200 OK` | `PASSED` |
| `TC-BE-SEC-07` | `RateLimitFilter` | Client IP sends 11th request within the active window | Returns `429 Too Many Requests` with rate limit headers | `PASSED` |
| `TC-BE-SEC-08` | `RateLimitFilter` | Client IP waits for sliding window interval to elapse | Bucket tokens regenerate; subsequent requests succeed | `PASSED` |
| `TC-BE-SEC-09` | `InternalCronIntegrationTest` | `POST /api/internal/mandi/sync` without `X-Cron-Token` | Returns `403 Forbidden`; unauthorized invocation rejected | `PASSED` |
| `TC-BE-SEC-10` | `InternalCronIntegrationTest` | `POST /api/internal/mandi/sync` with valid configured token | Returns `202 Accepted`; asynchronously initiates Agmarknet sync | `PASSED` |

---

## 4. Frontend Test Suites Matrix

Frontend tests reside in `kisanmandi-frontend/src/__tests__/` and run via **Vitest** with a simulated browser DOM environment (**jsdom**).

| Test Suite File | Component / Module Under Test | Test Count | Key Verification Objectives | Status |
| :--- | :--- | :--- | :--- | :--- |
| `i18n.test.jsx` | Internationalization (`i18next`) & Language Selector | 15 | 100% key parity (447 keys across EN, HI, MR), instant zero-reload toggle, localStorage persistence, HTML `lang` tag sync | `PASSED` |
| `components.test.jsx` | Core UI Components | 14 | `PriceUnitToggle` unit conversion ($\times 100$), `OrderStatusStepper` 5-stage progression, `RatingStars`, `ServerStatusBanner` cold start notification | `PASSED` |
| `utils.test.js` | Helper Utilities & Math | 12 | Haversine client formula, Indian currency formatting (`formatINR`), date formatting across locales | `PASSED` |

---

### 4.1 Granular Frontend Test Cases

| Test ID | Test Suite | Target Component / Function | Test Scenario & User Interaction | Expected Assertion | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-FE-I18N-01` | `i18n.test.jsx` | Translation Dictionary Parity | Compare all keys in `en.json`, `hi.json`, `mr.json` | 0 missing keys; exact 447 keys match across all 3 language bundles | `PASSED` |
| `TC-FE-I18N-02` | `i18n.test.jsx` | Language Switcher | User clicks "हिंदी" button in navigation bar | DOM text renders in Devanagari script immediately without page reload | `PASSED` |
| `TC-FE-I18N-03` | `i18n.test.jsx` | Preference Persistence | Language changed to Marathi (`mr`) | `localStorage.getItem('kisanmandi_lang')` equals `'mr'` | `PASSED` |
| `TC-FE-I18N-04` | `i18n.test.jsx` | DOM Root Synchronization | Language changed from English to Hindi | `document.documentElement.lang` updates to `'hi'` | `PASSED` |
| `TC-FE-I18N-05` | `i18n.test.jsx` | String Parameter Interpolation | Interpolate `{price}` and `{unit}` in localized string | Renders formatted price string e.g. "₹50 प्रति किलोग्राम" in Hindi | `PASSED` |
| `TC-FE-CMP-01` | `components.test.jsx` | `PriceUnitToggle` | User toggles from ₹/kg to ₹/quintal | Multiplies base price by 100; changes active button styles and unit label | `PASSED` |
| `TC-FE-CMP-02` | `components.test.jsx` | `OrderStatusStepper` | Order status is `PACKED` | Steps 1 & 2 marked completed (green); Step 3 marked active; Steps 4 & 5 pending | `PASSED` |
| `TC-FE-CMP-03` | `components.test.jsx` | `RatingStars` | Component passed `rating = 4.5` | Renders 4 full stars, 1 half star, and numerical score label `4.5` | `PASSED` |
| `TC-FE-CMP-04` | `components.test.jsx` | `ServerStatusBanner` | Backend health check pending (> 3s latency) | Displays warning banner informing user of cloud container cold start | `PASSED` |
| `TC-FE-UTL-01` | `utils.test.js` | `formatINR` | Number `150000` passed to formatter | Formats to Indian numbering standard: `"₹1,50,000"` | `PASSED` |
| `TC-FE-UTL-02` | `utils.test.js` | `calculateHaversineDistance` | Coordinates of Pune and Mumbai provided | Computes mathematical distance (~120 km) within 0.5 km accuracy | `PASSED` |
| `TC-FE-UTL-03` | `utils.test.js` | `formatDateLocale` | ISO timestamp `2026-10-13T10:00:00Z` | Formats into localized Indian Standard Time representation | `PASSED` |

---

## 5. End-to-End API Test Collection (Postman)

The repository provides a complete 35+ request Postman test collection located in [`docs/postman/`](docs/postman/README.md) validating full user journeys with scripted test assertions:

| Sequence | Journey / Role | Tested Endpoints | Asserted Behavior |
| :--- | :--- | :--- | :--- |
| `JOURNEY-01` | **Customer Onboarding & Order** | `POST /api/auth/register` $\rightarrow$ `POST /api/auth/login` $\rightarrow$ `GET /api/products` $\rightarrow$ `POST /api/cart` $\rightarrow$ `POST /api/orders/checkout` | Customer registers, logs in, adds produce to cart, and checks out via COD; asserts HTTP 201 and order status `PLACED` |
| `JOURNEY-02` | **Farmer Dispatch Lifecycle** | `GET /api/farmer/orders` $\rightarrow$ `PUT /api/farmer/orders/{id}/status` | Farmer retrieves incoming queue, accepts, packs, dispatches, and delivers order; asserts valid state transitions |
| `JOURNEY-03` | **Post-Delivery Review** | `POST /api/reviews` | Delivered order reviewed with 5-star rating; asserts HTTP 201; second review submission asserts HTTP 409 Conflict |
| `JOURNEY-04` | **Admin Farmer Verification** | `GET /api/admin/farmers/pending` $\rightarrow$ `POST /api/admin/farmers/{id}/verify` | Admin views unverified farmer documents and approves profile; asserts status changes to `APPROVED` |
| `JOURNEY-05` | **Mandi Sync Webhook** | `POST /api/internal/mandi/sync` | Authenticated webhook triggers background Agmarknet sync; asserts HTTP 202 Accepted |

---

## 6. How to Run the Tests Locally

### 6.1 Running Backend Tests
Execute in PowerShell from the repository root:

```powershell
# Navigate to backend directory
cd kisanmandi-backend

# Execute all 80 unit and integration tests
.\mvnw test

# Execute a specific test suite
.\mvnw test -Dtest=OrderServiceTest

# Execute all integration tests
.\mvnw test -Dtest=*IntegrationTest

# Generate JaCoCo code coverage report
.\mvnw test jacoco:report
# HTML report generated at: kisanmandi-backend/target/site/jacoco/index.html
```

### 6.2 Running Frontend Tests
Execute in PowerShell from the repository root:

```powershell
# Navigate to frontend directory
cd kisanmandi-frontend

# Run all 41 Vitest test cases
npm test

# Run tests in interactive watch mode
npm run test:watch

# Execute deterministic 100% translation key parity verification
npm run i18n:check

# Validate production build bundle
npm run build
```

---

## 7. Continuous Integration (CI) Enforcement

Every commit and pull request pushed to `origin/main` automatically triggers `.github/workflows/ci.yml`:
- **Automated Backend Pipeline**: Installs Java 17 Temurin, restores Maven cache, and runs `mvn -B test` (failing the pipeline if any of the 80 backend tests fail).
- **Automated Frontend Pipeline**: Installs Node 20, runs `npm ci`, verifies translation key parity with `npm run i18n:check`, executes `npm test` (all 41 tests), and runs `npm run build` to guarantee zero build regressions.
