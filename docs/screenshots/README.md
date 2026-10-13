# KisanMandi Screenshots Checklist

This checklist documents the exact 18 screenshots to capture for project documentation, showcasing both desktop and mobile (375px responsive) layouts across all three user roles and modules.

Save your captured PNG images directly in this folder (`docs/screenshots/`) using the exact filenames listed below.

---

| # | Filename | Page / Route | Viewport | Required State & Key Elements to Show |
| :---: | :--- | :--- | :---: | :--- |
| **01** | `01-home.png` | `/` (Home) | Desktop (1280px+) | Hero section, value proposition, quick category cards, language switcher in navbar, and featured produce. |
| **02** | `02-register-role.png` | `/register` | Desktop | Registration form showing the Farmer / Customer role toggle selection and validation fields. |
| **03** | `03-browse-filters.png` | `/products` | Desktop | Marketplace catalog with active category pills, price range slider, sort dropdown, and search query. |
| **04** | `04-near-me.png` | `/products` | Desktop | "Near Me" bar active, showing geolocation radius filter (e.g., within 25 km) and farmer distance tags. |
| **05** | `05-product-detail.png` | `/products/:id` | Desktop | Product detail page showing Cloudinary photo, farmer profile card with rating badge, price per kg/quintal, and Add to Cart button. |
| **06** | `06-cart.png` | `/customer/cart` | Desktop | Customer shopping cart displaying item quantity controls, item subtotals, delivery estimate, and checkout button. |
| **07** | `07-checkout.png` | `/customer/checkout` | Desktop | Checkout screen with address selection/addition, Cash on Delivery (COD) badge, and Place Order confirmation. |
| **08** | `08-order-tracking.png` | `/customer/orders/:id` | Desktop & Mobile | Stepper timeline showing active order progress (`PLACED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `PACKED` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`). |
| **09** | `09-farmer-dashboard.png` | `/farmer/dashboard` | Desktop | Farmer portal showing live overview stats: total revenue, active orders, low stock warnings, and quick action links. |
| **10** | `10-add-product.png` | `/farmer/products/add` | Desktop | Farmer crop listing form with category selection, unit dropdown (KG/Quintal), stock quantity, and Cloudinary image uploader. |
| **11** | `11-incoming-orders.png` | `/farmer/orders` | Desktop | Farmer order management queue showing pending customer orders with Accept, Pack, and Ship action buttons. |
| **12** | `12-mandi-dashboard.png` | `/mandi` | Desktop | Mandi Tracker featuring wholesale APMC rates, commodity search, district dropdown, and Recharts historical price trend. |
| **13** | `13-mandi-mobile.png` | `/mandi` | Mobile (375px) | Mobile responsive view of the Mandi dashboard, showing the Price Unit Toggle (₹/kg vs. ₹/quintal) and market cards. |
| **14** | `14-reviews.png` | `/farmers/:id` or `/farmer/reviews` | Desktop | Public reviews section showing customer star ratings (1-5), verified buyer badges, and feedback comments. |
| **15** | `15-admin-dashboard.png` | `/admin/dashboard` | Desktop | Admin overview showing platform metrics (total users, active farmers, total orders, system health status). |
| **16** | `16-admin-farmer-approval.png` | `/admin/farmers` | Desktop | Admin verification table showing pending farmer applications, uploaded identity documents preview, and Approve/Reject buttons. |
| **17** | `17-swagger.png` | `/swagger-ui/index.html` | Desktop | Interactive Springdoc OpenAPI / Swagger UI interface listing authenticated and public REST endpoints. |
| **18** | `18-hindi-marathi.png` | `/` or `/products` | Desktop & Mobile | Interface toggled to Hindi or Marathi, showing translated navigation, Devanagari typography, and localized numbers. |

---

## Screenshot Guidelines
- **Format**: High-resolution PNG (`.png`).
- **Data**: Use realistic crop names (e.g. Alphonso Mango, Onion Nashik, Basmati Paddy, Tomato) rather than lorem ipsum.
- **Privacy**: Do not capture real personal phone numbers or government identity numbers. Use demo test data.
