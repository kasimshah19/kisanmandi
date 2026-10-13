# KisanMandi Production Deployment Guide

This guide details the step-by-step production deployment workflow for KisanMandi using the free-tier stack:
- **Database**: Aiven MySQL (Free Tier)
- **Backend API**: Render Docker Web Service (Free Tier)
- **Frontend SPA**: Vercel (Hobby / Free Tier)
- **Media Storage**: Cloudinary (Free Tier)
- **APMC Mandi Cron**: GitHub Actions (Scheduled Workflow)

---

## 1. Managed Database: Aiven MySQL

1. Create a free account at [Aiven.io](https://aiven.io/).
2. Create a new service: select **MySQL** (Free Tier).
3. Choose a cloud region close to your target users (e.g., `ap-south-1` Mumbai / India).
4. Once provisioned, locate your connection credentials from the Aiven Service Overview:
   - **Host**: e.g., `mysql-xxxx-kisanmandi.aivencloud.com`
   - **Port**: e.g., `21453` (Aiven assigns non-standard ports)
   - **User**: `avnadmin`
   - **Password**: `<YOUR_AIVEN_PASSWORD>`
   - **Database Name**: `defaultdb`
5. Formulate the JDBC connection string with SSL enforced:
   ```text
   jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/defaultdb?ssl-mode=REQUIRED&serverTimezone=Asia/Kolkata
   ```
   *Note: In `application-prod.properties`, HikariCP connection pool is already optimized (`maximum-pool-size=5`) to stay comfortably within Aiven free-tier connection limits.*

---

## 2. Media Storage & Mandi API Keys

1. **Cloudinary**:
   - Sign up at [Cloudinary](https://cloudinary.com/) and navigate to the Dashboard.
   - Copy: `Cloud Name`, `API Key`, and `API Secret`.
2. **data.gov.in (Agmarknet Mandi API)**:
   - Sign up at [data.gov.in](https://data.gov.in) and copy your **API Key** from your user profile.
   - The default resource ID is preconfigured to: `9ef84268-d588-465a-a308-a864a43d0070` (Current Daily Price of Various Commodities from Various Markets).

---

## 3. Backend Deployment: Render (Docker Web Service)

1. Sign up / Log in to [Render](https://render.com/).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your Git repository.
4. Configure service settings:
   - **Name**: `kisanmandi-api`
   - **Root Directory**: `kisanmandi-backend`
   - **Runtime**: `Docker` *(Render will automatically build using `kisanmandi-backend/Dockerfile`)*
   - **Instance Type**: `Free` (0.1 CPU, 512 MB RAM)
   - **Health Check Path**: `/api/health`
5. Configure Environment Variables in the Render Dashboard:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Enables production profile |
   | `PORT` | `8080` | Container listening port |
   | `DB_URL` | `jdbc:mysql://<HOST>:<PORT>/defaultdb?ssl-mode=REQUIRED&serverTimezone=Asia/Kolkata` | Aiven MySQL JDBC URL |
   | `DB_USERNAME` | `avnadmin` | Aiven MySQL username |
   | `DB_PASSWORD` | `<AIVEN_PASSWORD>` | Aiven MySQL password |
   | `JWT_SECRET` | `<32+_CHAR_RANDOM_SECRET>` | Random secret for signing JWTs |
   | `APP_ADMIN_EMAIL` | `admin@kisanmandi.com` | Production admin email |
   | `APP_ADMIN_PASSWORD` | `<STRONG_ADMIN_PASSWORD>` | Production admin password |
   | `CLOUDINARY_CLOUD_NAME` | `<CLOUD_NAME>` | Cloudinary Cloud Name |
   | `CLOUDINARY_API_KEY` | `<API_KEY>` | Cloudinary API Key |
   | `CLOUDINARY_API_SECRET`| `<API_SECRET>` | Cloudinary API Secret |
   | `MANDI_API_KEY` | `<DATA_GOV_IN_KEY>` | data.gov.in API Key |
   | `APP_CORS_ALLOWED_ORIGINS` | `https://<YOUR_VERCEL_FRONTEND>.vercel.app` | Vercel frontend URL |
   | `MANDI_CRON_TOKEN` | `<RANDOM_SECRET_TOKEN>` | Webhook token for GitHub Actions cron |
   | `SWAGGER_ENABLED` | `true` (or `false`) | Enables Swagger docs on prod |
6. Click **Create Web Service**. Render will execute the multi-stage Docker build, start the container, and verify `/api/health`.
7. Copy your assigned Render backend URL (e.g., `https://kisanmandi-api.onrender.com`).

> [!WARNING]
> **Render Free-Tier Cold Sleep Caveat:**
> Render free-tier containers automatically spin down after 15 minutes of inactivity. When a new request arrives, waking the container can take between 30 and 60 seconds. KisanMandi's frontend includes an early health ping on load and displays an informative banner (`ServerStatusBanner`) so users are aware of the cold start.

---

## 4. Frontend Deployment: Vercel (Static SPA)

1. Sign up / Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project** $\rightarrow$ Import your Git repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `kisanmandi-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://<YOUR_RENDER_BACKEND>.onrender.com/api`
5. Click **Deploy**. Vercel will install dependencies, build the production bundle, and deploy the SPA.
6. SPA routing is automatically handled by the included `kisanmandi-frontend/vercel.json` rewrites.

---

## 5. APMC Mandi Sync: GitHub Actions Workflow

To ensure daily wholesale APMC rates refresh even when Render is sleeping:
1. In your GitHub repository, navigate to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Add the following repository secrets:
   - `BACKEND_URL`: `https://<YOUR_RENDER_BACKEND>.onrender.com` (no trailing slash)
   - `MANDI_CRON_TOKEN`: The exact same secret string you set in Render for `MANDI_CRON_TOKEN`.
3. The workflow `.github/workflows/mandi-sync.yml` runs automatically twice daily at **08:00 IST** and **19:00 IST**.
4. The workflow pings `POST /api/internal/mandi/sync`, which wakes the Render instance, triggers the sync asynchronously, records the run in `mandi_sync_logs`, and returns HTTP `202 Accepted`.

---

## 6. Post-Deployment Verification Checklist

1. [ ] Check `https://<YOUR_RENDER_URL>/api/health` returns `{"status":"UP"}`.
2. [ ] Open `https://<YOUR_VERCEL_URL>/` in a browser. Verify hero page loads and translation switcher works.
3. [ ] Register a customer account and a farmer account.
4. [ ] Log in as admin, approve the farmer, and verify document preview.
5. [ ] Log in as farmer, list a crop with photo, and verify Cloudinary image display.
6. [ ] Open `/mandi` and verify live Agmarknet mandi rates and charts render.
7. [ ] In GitHub Actions, manually trigger the **Mandi Daily Sync** workflow via `workflow_dispatch` and confirm HTTP 202/409 exit status.
