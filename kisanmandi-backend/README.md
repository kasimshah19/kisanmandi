# KisanMandi Backend

This is the backend for KisanMandi, built with Java 17 and Spring Boot 3.x.

## Setup Instructions
1. Copy `src/main/resources/application-local.properties.example` to `application-local.properties`.
2. Fill in the real credentials in `application-local.properties`.
3. Make sure MySQL is running on your machine.
4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

## Swagger UI
Once running, visit: `http://localhost:8080/swagger-ui/index.html`

## Health Check
`GET http://localhost:8080/api/health`
