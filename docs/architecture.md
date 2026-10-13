# KisanMandi Architecture Documentation

This document explains the architectural principles, layer structure, and core design decisions implemented across the KisanMandi platform.

---

## 1. System Overview

KisanMandi is designed as a decoupled, multi-tier web platform composed of:
1. **Client Tier**: Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS v4, deployed statically on Vercel.
2. **Application Tier**: RESTful backend built with Java 17 and Spring Boot 3.4.0, deployed as a containerized service on Render.
3. **Database Tier**: Managed MySQL 8 database hosted on Aiven with SSL enforced.
4. **External Services**:
   - **Cloudinary**: Cloud media management for product images and farmer identity documents.
   - **data.gov.in (Agmarknet)**: Government Open Data API providing daily APMC wholesale mandi rates.
   - **GitHub Actions**: External scheduler triggering headless cron syncs into the backend.

---

## 2. Core Architectural Decisions & Why

### 2.1 Stateless JWT Authentication & RBAC
- **Design**: Session state is completely eliminated on the server (`SessionCreationPolicy.STATELESS`). Every HTTP request carries an HTTP `Authorization: Bearer <token>` header.
- **Why**: 
  - Allows zero-downtime container restarts on Render without invalidating active user sessions.
  - Scales cleanly without needing sticky sessions or distributed Redis session stores.
  - JWT claims encode the user ID, email, and single role (`ROLE_CUSTOMER`, `ROLE_FARMER`, or `ROLE_ADMIN`), enabling declarative `@PreAuthorize("hasRole('FARMER')")` checks at controller and service levels.
- **Rate Limiting**: An in-memory sliding-window `RateLimitFilter` runs before Spring's authentication filters. Requests from identical client IP addresses are throttled to protect auth and public endpoints against brute force attacks.

### 2.2 Snapshot Data in Orders
- **Design**: When an order is placed:
  - The shipping address is extracted from `addresses` and copied field-by-field into `orders` (`shipName`, `shipPhone`, `shipLine1`, `shipCity`, `shipState`, `shipPincode`).
  - Line items in `order_items` duplicate the product name, unit, unit price, and image URL directly from the `products` table at checkout time.
- **Why**:
  - **Financial Immutability**: If a customer modifies their default home address next week, past order receipts remain historically accurate.
  - **Audit Integrity**: If a farmer renames a crop, raises the price from ₹25/kg to ₹40/kg, or deletes the product image on Cloudinary, prior sales records and tax invoices remain permanently unchanged.

### 2.3 Atomic Stock Deductions & Concurrency
- **Design**: Stock checks and inventory reservations execute inside a single `@Transactional` boundary in `OrderService`.
  - When placing an order, `Product.getQuantityAvailable()` is checked against requested quantity.
  - Inventory is immediately decremented: `product.setQuantityAvailable(available - ordered)`.
  - If a farmer rejects the order or a customer cancels before preparation, the exact quantities are atomically restored back to `quantity_available`.
- **Why**:
  - Prevents race conditions and overselling fresh, perishable stock when multiple buyers checkout concurrently.

### 2.4 Soft Delete Pattern
- **Design**: `Product` entities include a `deleted` boolean flag (default `false`). Calling `DELETE /api/farmer/products/{id}` marks `deleted = true` rather than issuing an SQL `DELETE FROM products`.
- **Why**:
  - Hard deletions in relational databases violate foreign key constraints on past `order_items`.
  - Retains complete historical reporting for farmer sales, ratings, and analytics while cleanly filtering out deleted items from the public marketplace catalog.

### 2.5 Hybrid APMC Scheduler + External Cron Endpoint
- **Design**:
  - In addition to Spring's internal `@Scheduled` cron jobs (`mandi.sync.cron`), the backend exposes an internal endpoint: `POST /api/internal/mandi/sync`.
  - This endpoint is protected exclusively by the `X-Cron-Token` HTTP header, verified using constant-time byte comparison (`MessageDigest.isEqual`) to prevent timing attacks.
  - A scheduled GitHub Actions workflow triggers this endpoint twice daily (08:00 IST and 19:00 IST).
- **Why (The Render Cold-Sleep Problem)**:
  - Free-tier containers on Render spin down into sleep mode after 15 minutes of inactivity.
  - An internal `@Scheduled` background thread stops ticking when the container sleeps, meaning scheduled daily price updates would fail to run.
  - The external GitHub Actions webhook automatically wakes the asleep container via an HTTP ping, executes the background synchronization, records the log in `mandi_sync_logs`, and exits cleanly.

### 2.6 Geolocation Discovery via Haversine Formula
- **Design**: Customer and farmer addresses store optional decimal coordinates (`latitude`, `longitude`).
  - Distance between customer coordinate $(lat_1, lon_1)$ and farmer farm $(lat_2, lon_2)$ is computed using the spherical Haversine formula:
    $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cos(lat_2) \sin^2\left(\frac{\Delta lon}{2}\right)}\right)$$
  - Implemented in `NearbyService` with a default radius of 50 km and configurable limits.
- **Why**:
  - Allows consumers to instantly locate nearby farm gates for hyper-fresh produce without relying on expensive third-party mapping API subscriptions.

---

## 3. Backend Layered Architecture

```
com.kisanmandi
├── config/              # Security, CORS, Swagger OpenAPI, Cloudinary, Seeder configs
├── controller/          # REST endpoints; input validation; HTTP status mapping
├── dto/                 # Request/response records and validation rules (@NotBlank, @Min)
├── entity/              # JPA domain entities mapped to MySQL tables
├── exception/           # Custom business exceptions & centralized GlobalExceptionHandler
├── repository/         # Spring Data JPA repositories with derived and JPQL queries
├── security/            # JWT filters, UserDetailsService, Token utilities, Rate limiting
└── service/             # Core business rules, transactions, 3rd party integrations
```

1. **Controller Layer**: 
   - Receives HTTP requests, validates DTOs with `@Valid`, and delegates immediately to services.
   - Never contains direct database queries or raw SQL.
2. **Service Layer**:
   - Contains business logic, authorization rules, stock calculations, and transactional boundaries (`@Transactional`).
3. **Repository Layer**:
   - Pure Spring Data interfaces extending `JpaRepository` with custom index queries (`findByApprovalStatus`, `findNearbyFarmers`).
4. **Exception Layer**:
   - Centralized `GlobalExceptionHandler` converts exceptions into standardized RFC-compliant JSON responses with clear HTTP statuses (400, 401, 403, 404, 409, 500).

---

## 4. Frontend Architecture

```
kisanmandi-frontend/src
├── api/                 # Central Axios instance with interceptors for JWT & 401 redirect
├── components/          # Reusable UI widgets (Navbar, Footer, Modals, Badges, Charts)
├── context/             # React Context for global state (AuthContext, CartContext)
├── hooks/               # Custom hooks (useGeolocation, useDebounce, etc.)
├── i18n/                # Internationalization config (i18next, language detection)
├── locales/             # JSON locale dictionary files (en.json, hi.json, mr.json)
├── pages/
│   ├── public/          # Home, Login, Register, Marketplace, Mandi Tracker
│   ├── customer/        # Dashboard, Cart, Checkout, Order Tracking, Addresses
│   ├── farmer/          # Dashboard, Inventory, Orders, Earnings, Reviews, Mandi Rates
│   └── admin/           # Dashboard, Farmer Approvals, Users, Categories, Orders
└── routes/              # ProtectedRoute component enforcing RBAC redirects
```

- **Early Server Ping**: `App.jsx` silently pings `/api/health` on initial page mount. If the Render container is asleep, `ServerStatusBanner` alerts the user with a friendly animated progress indicator while the server boots up.
- **Code Splitting**: Heavy dashboards (`MandiDashboard`, `Recharts` graphs, admin panels) are dynamically imported using `React.lazy()` and `Suspense`, ensuring fast first-load times on 3G rural mobile connections.
- **Language Detection & Font Switching**: The UI detects saved language preference from `localStorage` (`kisanmandi_lang`) and applies `"Noto Sans Devanagari"` dynamically to ensure beautiful rendering of Devanagari ligatures.
