# ADR 001: Adopt Flyway for Database Migrations and Baseline Strategy

## Status
Accepted

## Context
Previously, KisanMandi relied on Hibernate's `spring.jpa.hibernate.ddl-auto=update` across profiles and had no automated, version-controlled database migration framework.

This created multiple architectural and operational risks:
1. **Uncontrolled Schema Drift**: Hibernate `ddl-auto=update` does not delete removed columns, alter ENUM definitions, modify existing constraints, or provide auditability.
2. **Environment Disparity**: The local MySQL database contained 12 tables with test/QA data, whereas target production environments (such as Aiven MySQL on Render) required automated, reproducible schema provisioning without manual execution of ad-hoc SQL files.
3. **Hibernate Auto-DDL in Production**: Running `ddl-auto=update` in production poses extreme risk of accidental data mutation or locking tables during startup.
4. **Lack of Test Isolation**: Tests previously executed against local MySQL or had incomplete isolation, creating dependencies on external state.

## Decision
We adopted **Flyway** (`flyway-core` + `flyway-mysql`) as the database migration engine for KisanMandi, combined with Hibernate schema validation:

1. **Strict Baseline Migration (`V1__baseline.sql`)**:
   - Authored `V1__baseline.sql` containing the canonical DDL for all 12 existing tables (`users`, `farmer_profiles`, `addresses`, `categories`, `products`, `cart_items`, `orders`, `order_items`, `order_status_history`, `reviews`, `mandi_prices`, `mandi_sync_logs`).
   - Declared tables in strict foreign-key dependency order.
   - Enforced explicit, human-readable constraint and index names (`pk_*`, `uk_*`, `fk_*`, `idx_*`).
   - Retained exact MySQL `ENUM` definitions for all 11 enum-mapped columns.

2. **Schema Validation Policy**:
   - Configured `spring.jpa.hibernate.ddl-auto=validate` in both `application.properties` and `application-prod.properties`.
   - Removed all `DDL_AUTO` environment variable overrides to eliminate runtime circumvention.

3. **Dual-Environment Baseline Strategy**:
   - Configured `spring.flyway.baseline-on-migrate=true` and `spring.flyway.baseline-version=1`.
   - On existing databases with pre-existing tables, Flyway registers a baseline entry at version 1 without executing `V1__baseline.sql`.
   - On fresh, empty databases (such as a new Aiven MySQL instance), Flyway applies `V1__baseline.sql` as a standard migration.

4. **Test Isolation & Parity Architecture**:
   - Unit and standard integration tests run against an isolated, in-memory H2 database with `spring.flyway.enabled=false` and `ddl-auto=create-drop`.
   - Outbound network calls (e.g. `MandiApiClient`) are mocked or pointed to an unreachable dummy address in the test profile.
   - Provided `MySqlIntegrationTest` with MySQL 8 Testcontainers (`@Testcontainers(disabledWithoutDocker = true)`) for verifying Flyway migrations, MySQL enum parity (`EnumSchemaParityTest`), and atomic concurrency (`AtomicStockDecrementIntegrationTest`) in CI.

## Consequences

### Positive
- **Deterministic Deployments**: Deploying to empty databases (e.g., Aiven MySQL) is zero-touch; the schema is created automatically on first startup.
- **Fail-Fast Safety**: If an entity mapping does not match the database schema, Hibernate `validate` fails fast on startup rather than causing subtle runtime SQL exceptions.
- **Auditable Evolution**: Every schema alteration is versioned in Git under `src/main/resources/db/migration/` and tracked in `flyway_schema_history`.
- **Complete Test Isolation**: Tests run offline without mutating local or shared databases.

### Negative / Trade-offs
- Developers must manually author SQL migrations for any schema changes rather than relying on automatic Hibernate DDL updates.
- Enum modifications require both updating the Java enum and adding an `ALTER TABLE` migration.
