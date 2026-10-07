# KisanMandi API Keys and Secrets Setup

This document explains how to set up the necessary third-party services and configure your local environment securely.

**CRITICAL RULE:** Never commit `application-local.properties` or `.env` files to GitHub. Always use placeholder files (like `application-local.properties.example` and `.env.example`) for source control.

## 1. MySQL Database Setup
1. Ensure MySQL is installed and running on your machine.
2. Create the database: The application will automatically create `kisanmandi_db` on startup if it doesn't exist, thanks to the connection string configuration.
3. Configure your local credentials:
   - Open `kisanmandi-backend/src/main/resources/application-local.properties`.
   - Update `DB_USERNAME` (default is `root`) and `DB_PASSWORD` to match your local MySQL setup.

## 2. data.gov.in (Mandi Prices API)
1. Go to [data.gov.in](https://data.gov.in) and register/login.
2. Navigate to your profile to find your **API Key**.
3. Search for the dataset: "Current Daily Price of Various Commodities from Various Markets (Mandi)".
4. Click on the API button for the dataset to find its **Resource ID** (a long alphanumeric string in the API URL).
5. Open `kisanmandi-backend/src/main/resources/application-local.properties`.
6. Set `MANDI_API_KEY` to your API key.
7. Replace `REPLACE_ME` in `mandi.api.resource-id` in `application.properties` with the actual Resource ID you found.

## 3. Cloudinary (Image Uploads)
1. Go to [cloudinary.com](https://cloudinary.com/) and create a free account.
2. Go to the Programmable Media Dashboard.
3. Locate your **Cloud Name**, **API Key**, and **API Secret**.
4. Open `kisanmandi-backend/src/main/resources/application-local.properties`.
5. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` with the values from your dashboard.

## 4. JWT Secret
1. Open `kisanmandi-backend/src/main/resources/application-local.properties`.
2. Set `JWT_SECRET` to a long, random string (e.g., generated via a password manager). This will be used in Phase 1 for secure authentication.

## Where do these go?
All sensitive real values go strictly into:
- **Backend:** `kisanmandi-backend/src/main/resources/application-local.properties` (git-ignored).
- **Frontend:** `kisanmandi-frontend/.env` (git-ignored).

Do not edit `application.properties` with real secrets, as that file is tracked in git.
