# KisanMandi ER Diagram

```mermaid
erDiagram
    users {
        int id PK
        string name
        string email
        string password
        string phone
        string role "FARMER/CUSTOMER/ADMIN"
        string status
        datetime created_at
    }

    farmer_profiles {
        int id PK
        int user_id FK "one-to-one"
        string farm_name
        string village
        string district
        string state
        string pincode
        float latitude
        float longitude
        string approval_status "PENDING/APPROVED/REJECTED"
        string document_url
    }

    categories {
        int id PK
        string name
    }

    products {
        int id PK
        int farmer_id FK "FK to users"
        int category_id FK "FK to categories"
        string name
        string description
        decimal price_per_unit
        string unit
        int quantity_available
        string image_url
        boolean is_active
    }

    addresses {
        int id PK
        int user_id FK "FK to users"
        string line1
        string city
        string state
        string pincode
        float latitude
        float longitude
    }

    cart_items {
        int id PK
        int customer_id FK "FK to users"
        int product_id FK "FK to products"
        int quantity
    }

    orders {
        int id PK
        int customer_id FK "FK to users"
        int farmer_id FK "FK to users"
        int address_id FK "FK to addresses"
        decimal total_amount
        string status
        string payment_mode
        datetime created_at
    }

    order_items {
        int id PK
        int order_id FK "FK to orders"
        int product_id FK "FK to products"
        int quantity
        decimal price_at_order
    }

    order_status_history {
        int id PK
        int order_id FK "FK to orders"
        string status
        datetime updated_at
    }

    reviews {
        int id PK
        int order_id FK "unique"
        int customer_id FK "FK to users"
        int farmer_id FK "FK to users"
        int rating "1-5"
        string comment
        datetime created_at
    }

    mandi_prices {
        int id PK
        string state
        string district
        string market
        string commodity
        string variety
        decimal min_price
        decimal max_price
        decimal modal_price
        date price_date "unique on market+commodity+variety+price_date"
    }

    mandi_sync_logs {
        int id PK
        datetime run_time
        string status
        int records_fetched
        int records_saved
        string error_message
    }

    users ||--o| farmer_profiles : "has"
    users ||--o{ products : "sells"
    users ||--o{ addresses : "has"
    users ||--o{ cart_items : "adds"
    users ||--o{ orders : "places (customer) / receives (farmer)"
    categories ||--o{ products : "contains"
    products ||--o{ cart_items : "in"
    products ||--o{ order_items : "in"
    orders ||--o{ order_items : "contains"
    orders ||--o{ order_status_history : "tracks"
    orders ||--o| reviews : "has"
```

## Explanation
- **users**: Stores all users (Farmers, Customers, Admins).
- **farmer_profiles**: Extended details for farmers (linked one-to-one with users).
- **categories**: Product categories (e.g., Vegetables, Fruits).
- **products**: Items listed by farmers.
- **addresses**: Delivery addresses for customers.
- **cart_items**: Shopping cart contents for customers.
- **orders**: Main order record linking customer, farmer, and delivery address.
- **order_items**: Individual products within an order.
- **order_status_history**: Audit trail of status changes for an order.
- **reviews**: Feedback given by customers on completed orders.
- **mandi_prices**: Daily price data fetched from data.gov.in.
- **mandi_sync_logs**: Logs of background jobs fetching mandi prices.

## Order Status Flow
`PLACED` -> `ACCEPTED` -> `PACKED` -> `OUT_FOR_DELIVERY` -> `DELIVERED` (or `REJECTED` / `CANCELLED`)
