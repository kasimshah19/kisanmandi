# KisanMandi - Phase 1 Test Credentials

Yeh file sirf testing ke purpose ke liye banayi gayi hai. Isme Phase 1 (Authentication aur RBAC) test karne ke liye banaye gaye demo accounts ki details hain.

## 🧑‍🌾 Farmer Account
Farmer dashboard aur farmer-specific APIs ko test karne ke liye:
| Field | Value |
| :--- | :--- |
| **Name** | Ramesh |
| **Email** | `ramesh@test.com` |
| **Password** | `password123` |
| **Role** | `FARMER` |
| **Dashboard** | `http://localhost:5173/farmer/dashboard` |

## 🛍️ Customer Account
Customer dashboard aur customer-specific APIs ko test karne ke liye:
| Field | Value |
| :--- | :--- |
| **Name** | Amit Customer |
| **Email** | `amit@test.com` |
| **Password** | `password123` |
| **Role** | `CUSTOMER` |
| **Dashboard** | `http://localhost:5173/customer/dashboard` |

## 🛡️ Admin Account
Admin dashboard aur admin-specific APIs ko test karne ke liye. Yeh account backend ke startup par `DataSeeder` ke through auto-create hota hai.
| Field | Value |
| :--- | :--- |
| **Name** | Admin |
| **Email** | `admin@kisanmandi.com` |
| **Password** | `Admin@123` |
| **Role** | `ADMIN` |
| **Dashboard** | `http://localhost:5173/admin/dashboard` |

---
**Note:** `admin@kisanmandi.com` ke credentials backend ke `application-local.properties` file se aate hain. Kisi naye farmer ya customer ko test karne ke liye aap frontend se naya registration bhi kar sakte hain.
