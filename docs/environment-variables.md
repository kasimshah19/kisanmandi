# Environment Variables

| Variable | Required? | Example | Where Used | Platform |
|---|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | No | `prod` | Spring profile | Render/local |
| `PORT` | No | `8080` | Web server port | Render/local |
| `DB_URL` | Yes (prod) | `jdbc:mysql://mysql.example.com:3306/db?useSSL=true` | Database connection | Render |
| `DB_USERNAME` | Yes (prod) | `avnadmin` | Database user | Render/local |
| `DB_PASSWORD` | Yes (prod) | `secretpassword` | Database password | Render/local |
| `DDL_AUTO` | No | `update` | Hibernate schema | Render |
| `JWT_SECRET` | Yes | `thisismyverylongjwtsecretkeyfortest` | JWT token signature | Render/local |
| `APP_ADMIN_EMAIL` | No | `admin@kisanmandi.com` | Admin seeder | Render/local |
| `APP_ADMIN_PASSWORD` | No | `admin123` | Admin seeder | Render/local |
| `CLOUDINARY_CLOUD_NAME` | Yes | `dabcdefgh` | Cloudinary uploads | Render/local |
| `CLOUDINARY_API_KEY` | Yes | `123456789012345` | Cloudinary uploads | Render/local |
| `CLOUDINARY_API_SECRET` | Yes | `abcdefghijklmnop` | Cloudinary uploads | Render/local |
| `MANDI_RESOURCE_ID` | No | `9ef84268-d588...` | Mandi sync | Render/local |
| `MANDI_API_KEY` | Yes | `apikey123` | Mandi sync | Render/local |
| `APP_CORS_ALLOWED_ORIGINS` | No | `https://kisanmandi.vercel.app` | CORS filter | Render/local |
| `MANDI_CRON_TOKEN` | No | `my-cron-secret` | Internal cron endpoint | Render |
| `SWAGGER_ENABLED` | No | `false` | API Docs | Render/local |
