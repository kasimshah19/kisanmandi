# KisanMandi Postman API Testing Guide

This directory contains the official Postman v2.1 collection and environment configuration for testing all KisanMandi REST APIs.

---

## 1. Files in this Directory

- `KisanMandi.postman_collection.json`: The complete API test collection containing 35+ structured requests categorized by module:
  - **Auth**: Customer, Farmer, and Admin registration and login flows.
  - **Public**: Health, category listing, public product catalog, farmer profile, and Haversine geo-discovery.
  - **Customer**: Address book, shopping cart, Cash on Delivery (COD) checkout, and order reviews.
  - **Farmer**: Profile update, document upload, crop catalog management (multipart), and order lifecycle transitions.
  - **Admin**: Platform analytics, farmer approvals/rejections, category toggles, moderation, and manual APMC sync.
  - **Mandi (Public)**: Daily APMC prices, commodity trends, and multi-market comparison queries.
  - **Negative Tests**: 401 Unauthorized, 403 Forbidden, 400 Validation errors, and 409 Duplicate registration conflicts.
- `KisanMandi.local.postman_environment.json`: Local environment configuration holding base URLs, demo credential placeholders, dynamic IDs, and bearer tokens.

---

## 2. Importing into Postman

1. Open Postman desktop app.
2. In the top-left corner, click **Import**.
3. Select or drag & drop both:
   - `docs/postman/KisanMandi.postman_collection.json`
   - `docs/postman/KisanMandi.local.postman_environment.json`
4. In the top-right environment dropdown, select **KisanMandi (Local Environment)**.

---

## 3. Environment Variables & Automatic Token Handling

The environment file defines the following variables:
- `baseUrl`: Default `http://localhost:8080/api`.
- `customerEmail`, `customerPassword`: Demo customer credentials.
- `farmerEmail`, `farmerPassword`: Demo farmer credentials.
- `adminEmail`, `adminPassword`: Admin credentials matching `application-local.properties`.
- `customerToken`, `farmerToken`, `adminToken`: Automatically populated when executing login requests!

### Automatic Token Script
Every login request contains a Postman test script that automatically extracts the returned JWT token and stores it directly into your active environment:
```javascript
var jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("customerToken", jsonData.token);
}
```
Subsequent requests in the collection automatically consume `Bearer {{customerToken}}`, `Bearer {{farmerToken}}`, or `Bearer {{adminToken}}`.

---

## 4. Running the Collection in Postman Collection Runner

1. In the left sidebar, click the **KisanMandi API Collection**.
2. Click **Run collection** at the top right of the collection overview.
3. Recommended execution order:
   - Run **Auth** first (generates valid JWT tokens).
   - Run **Public**, **Customer**, **Farmer**, **Admin**, and **Mandi**.
   - Run **Negative Tests** to verify HTTP 400, 401, 403, and 409 security protections.
4. Click **Run KisanMandi API Collection**. Postman will execute all test assertions and generate a test results report.

---

## 5. Running Headlessly with Newman (CLI)

You can run the entire collection headlessly from your terminal using `newman` without installing anything globally:

```powershell
# From the repository root
npx newman run docs/postman/KisanMandi.postman_collection.json `
  -e docs/postman/KisanMandi.local.postman_environment.json `
  --reporters cli
```

To export an HTML test report:

```powershell
npx newman run docs/postman/KisanMandi.postman_collection.json `
  -e docs/postman/KisanMandi.local.postman_environment.json `
  -r cli,htmlextra `
  --reporter-htmlextra-export docs/postman/newman-report.html
```
