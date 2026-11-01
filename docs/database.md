# KisanMandi Database Architecture & Migration Guide

## 1. Overview
KisanMandi uses **Flyway** for database versioning and schema migrations alongside Spring Boot 3.4 and Hibernate 6.
- **ORM Schema Mode**: `spring.jpa.hibernate.ddl-auto=validate` across both development (`application.properties`) and production (`application-prod.properties`).
- **Flyway Integration**: Enabled across MySQL environments with `baseline-on-migrate=true`, `baseline-version=1`, and `validate-on-migrate=true`.
- **Test Database**: In-memory H2 with `spring.flyway.enabled=false` and `spring.jpa.hibernate.ddl-auto=create-drop` to keep test suites ultra-fast, completely isolated, and offline-compatible.

---

## 2. Migration Directory & File Naming Conventions

All migration files are located in:
`kisanmandi-backend/src/main/resources/db/migration/`

### File Naming Pattern
`V<Version>__<Description>.sql`
- `V`: Prefix for versioned migrations (uppercase).
- `<Version>`: Numeric version (e.g. `1`, `2`, `2_1`).
- `__`: Exactly TWO underscores separating version and description.
- `<Description>`: Snake_case or PascalCase description of the change (e.g. `V1__baseline.sql`, `V2__add_payout_history.sql`).
- `.sql`: SQL file extension.

### Cardinal Migration Rules
1. **IMMUTABLE MIGRATIONS**: Never edit or rename a migration file that has already been applied or committed. If you need to make changes, write a new versioned migration (e.g., `V2__...`).
2. **STRICT ENUM PARITY**:
   - When introducing or altering enum constants in Java entity classes (`@Enumerated(EnumType.STRING)`), you **MUST** create a corresponding migration file altering the column definition:
     ```sql
     ALTER TABLE orders MODIFY COLUMN status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED') NOT NULL;
     ```
   - Running `EnumSchemaParityTest` in CI verifies that every Java enum constant has a matching value in the MySQL table schema.
3. **EXPLICIT CONSTRAINT NAMES**: Always declare explicit, human-readable constraint and index names:
   - Primary Keys: `pk_<table>`
   - Unique Keys: `uk_<table>_<column>`
   - Foreign Keys: `fk_<table>_<referenced_table>`
   - Indexes: `idx_<table>_<column>`
4. **ENGINE & CHARSET**: Every table must specify:
   ```sql
   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   ```

---

## 3. The Baseline Strategy

To prevent schema conflicts when introducing Flyway into an existing application with live databases:
- **Baseline Configuration**:
  ```properties
  spring.flyway.baseline-on-migrate=true
  spring.flyway.baseline-version=1
  ```
- **Behavior on Existing Dev DB**:
  - Flyway detects tables already present in the database.
  - Instead of re-executing `V1__baseline.sql` (which would fail due to `CREATE TABLE`), Flyway automatically inserts a baseline record in `flyway_schema_history` at version 1 with `type=BASELINE` and marks it successful.
  - Future migrations (`V2`, `V3`, etc.) will execute on top of this baseline.
- **Behavior on Fresh DB (e.g., Aiven Production)**:
  - When starting against an empty database, Flyway detects an empty schema.
  - It automatically applies `V1__baseline.sql` (`type=SQL`), creating all 12 tables, indexes, constraints, and initial structure cleanly.
  - **No manual SQL scripts need to be run on Aiven.** Simply set the database credentials in Render and start the service.

---

## 4. Local Scratch Database Verification Protocol

Before committing any new migration file, follow this 4-step verification protocol:

1. **Create an empty scratch database**:
   ```sql
   CREATE DATABASE kisanmandi_scratch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. **Point the backend to the scratch database**:
   Set `DB_URL=jdbc:mysql://localhost:3306/kisanmandi_scratch` and run the application.
3. **Verify clean execution**:
   - Check application startup logs: Flyway executes all migrations in sequence.
   - Hibernate schema validation passes (`Schema-validation: both table and column validate cleanly`).
   - `flyway_schema_history` records `success = 1` for all applied versions.
4. **Drop scratch database**:
   ```sql
   DROP DATABASE kisanmandi_scratch;
   ```

---

## 5. Schema Reference: Core Tables

The baseline migration (`V1__baseline.sql`) manages the canonical schema for KisanMandi's 12 core tables:
1. `users` (Authentication, roles, user status)
2. `farmer_profiles` (Farmer verification, farm location, UPI details)
3. `addresses` (Customer delivery addresses)
4. `categories` (Crop / Produce categories)
5. `products` (Produce listings, quantity, pricing, units)
6. `cart_items` (Customer cart with composite unique key `(customer_id, product_id)`)
7. `orders` (Marketplace orders, payment mode, payment status)
8. `order_items` (Order snapshot items, prices, quantities)
9. `order_status_history` (Order transition audit trail)
10. `reviews` (Order reviews with unique constraint on `order_id`)
11. `mandi_prices` (APMC Mandi daily market rates with unique index)
12. `mandi_sync_logs` (Agmarknet sync audit history)
