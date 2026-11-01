# Environment Variables

| Variable | Required? | Example (Fake) | Where Used | Platform |
|---|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | No (default `local`) | `prod` | Spring profile selection | Render/local |
| `PORT` | No (default `8080`) | `8080` | Web server port | Render/local |
| `DB_URL` | Yes (prod) | `jdbc:mysql://mysql-aiven.example.com:21453/defaultdb?ssl-mode=REQUIRED&serverTimezone=Asia/Kolkata` | Database connection URL | Render |
| `DB_USERNAME` | Yes (prod) | `avnadmin` | Database username | Render/local |
| `DB_PASSWORD` | Yes (prod) | `secretpassword123` | Database password | Render/local |
| `JWT_SECRET` | Yes | `super_secret_jwt_key_at_least_32_characters_long` | JWT token signature (>= 32 chars) | Render/local |
| `APP_ADMIN_EMAIL` | No | `admin@kisanmandi.com` | Auto-seed admin user | Render/local |
| `APP_ADMIN_PASSWORD` | No | `Admin@Secure123` | Auto-seed admin password | Render/local |
| `CLOUDINARY_CLOUD_NAME` | Yes | `dabcdefgh` | Cloudinary image & doc storage | Render/local |
| `CLOUDINARY_API_KEY` | Yes | `123456789012345` | Cloudinary API key | Render/local |
| `CLOUDINARY_API_SECRET` | Yes | `abcdefghijklmnop12345` | Cloudinary API secret | Render/local |
| `MANDI_RESOURCE_ID` | No | `9ef84268-d588-465a-a308-a864a43d0070` | data.gov.in Mandi dataset ID | Render/local |
| `MANDI_API_KEY` | Yes | `579b464db66ec23bdd000001fakeapikey123` | data.gov.in Mandi prices API key | Render/local |
| `APP_CORS_ALLOWED_ORIGINS` | Yes (prod) | `https://kisanmandi.vercel.app,http://localhost:5173` | Allowed CORS origins (comma-separated) | Render/local |
| `MANDI_CRON_TOKEN` | No (recommended prod) | `secure_cron_token_for_render_ping` | Daily APMC Mandi sync cron token | Render |
| `SWAGGER_ENABLED` | No (default `false` in prod) | `true` | Enable/disable Swagger UI & docs | Render/local |
| `APP_DEMO_ENABLED` | No (default `false`) | `false` | Enable/disable demo accounts seeder | Render/local |
| `APP_DEMO_CUSTOMER_EMAIL`| No | `customer@demo.com` | Demo customer email | Render/local |
| `APP_DEMO_CUSTOMER_PASSWORD`| No | `DemoCustomer@123` | Demo customer password | Render/local |
| `APP_DEMO_FARMER_EMAIL` | No | `farmer@demo.com` | Demo farmer email | Render/local |
| `APP_DEMO_FARMER_PASSWORD` | No | `DemoFarmer@123` | Demo farmer password | Render/local |
| `SENTRY_DSN` | No (empty = disabled) | `https://abc@o123.ingest.sentry.io/456` | Backend Sentry error reporting DSN | Render/local |
| `APP_MAIL_ENABLED` | No (default `false`) | `false` | Enable/disable actual SMTP dispatch (gracefully logs links if false) | Render/local |
| `APP_MAIL_FROM` | No (default `no-reply@kisanmandi.com`) | `support@kisanmandi.com` | Outgoing email sender address | Render/local |
| `APP_FRONTEND_URL` | No (default `http://localhost:5173`) | `https://kisanmandi.vercel.app` | Base frontend URL for reset & verification action links | Render/local |
| `SPRING_MAIL_HOST` | No (default `smtp.gmail.com`) | `smtp.resend.com` | SMTP host for email delivery | Render/local |
| `SPRING_MAIL_PORT` | No (default `587`) | `587` | SMTP port | Render/local |
| `SPRING_MAIL_USERNAME` | No (prod if mail enabled) | `resend_or_gmail_user` | SMTP username | Render/local |
| `SPRING_MAIL_PASSWORD` | No (prod if mail enabled) | `resend_or_app_password` | SMTP password / API token | Render/local |
| `APP_PAYMENT_ENABLED` | No (default `false`) | `true` | Enable/disable online payments (falls back to COD if false) | Render/local |
| `RAZORPAY_KEY_ID` | No (prod if payment enabled) | `rzp_live_abcdef123456` | Razorpay public Key ID | Render/local |
| `RAZORPAY_KEY_SECRET` | No (prod if payment enabled) | `your_razorpay_secret_key` | Razorpay secret key (HMAC-SHA256 signature verification) | Render/local |
| `RAZORPAY_WEBHOOK_SECRET` | No (prod if webhook used) | `your_webhook_signing_secret` | Razorpay webhook signature secret | Render/local |
| `VITE_API_BASE_URL` | Yes (frontend) | `https://kisanmandi-api.onrender.com/api` | Frontend API client base URL | Vercel/local |
| `VITE_SENTRY_DSN` | No (empty = disabled) | `https://abc@o123.ingest.sentry.io/456` | Frontend Sentry error reporting DSN | Vercel/local |
