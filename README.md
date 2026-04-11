# Smart Campus Operations Hub — Member 4 module

This slice implements **session-based authentication** (local username/email + password, **Google OAuth2**), **roles** (`USER`, `TECHNICIAN`, `ADMIN`), **in-app notifications** (categories include **System** for hub-wide messages; ticket categories reserved for a future ticket module), **notification preferences** (ticket-related toggles), **admin user / role management**, **support / problem reports** from users to admins with **system notifications**, and **safe account deletion** (cascading related rows so the delete action completes).

The **UI separates student self-service** (home, preferences, report a problem) from the **operations console** (dashboard, users, support queue, broadcast notifications, account) for `ADMIN` and `TECHNICIAN` roles.

## Prerequisites

- **JDK 21** (`pom.xml` targets Java 21)
- **MySQL** 8.x
- **Node.js** 20+ (Vite frontend)

## MySQL setup

1. Start MySQL. The app uses database **`campus_hub`** (created automatically when the JDBC URL includes `createDatabaseIfNotExist=true`).
2. Set credentials if they differ from defaults in `backend/src/main/resources/application.properties` (`DB_USERNAME`, `DB_PASSWORD`), for example in PowerShell:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
```

3. **Reference DDL** (for ERD / documentation): `backend/src/main/resources/db/schema-reference.sql`. At runtime, Hibernate `ddl-auto=update` updates the schema from JPA entities.

### If you see `Data truncated for column 'category'` (notifications)

Older databases may have `notifications.category` as a MySQL `ENUM` that does not include `SYSTEM`. Run once:

`backend/src/main/resources/db/fix-notifications-category-mysql.sql`

(Converts the column to `VARCHAR(64)` so all categories, including `SYSTEM`, persist correctly.)

| Table / area | Purpose |
|----------------|---------|
| `users` | `full_name`, `email`, optional `username` (unique, local sign-in), `password_hash` (local only), `role`, `auth_provider`, `enabled`, timestamps |
| `notifications` | Per-user notifications: `category` (`SYSTEM`, `BOOKING`, `FACILITY`, `TICKET_*`), title, message, read flag, optional reference |
| `notification_preferences` | Per-user toggles for **ticket** notification channels (system messages are always delivered) |
| `password_reset_tokens` | Forgot-password demo tokens |
| `support_requests` | User problem reports; admins update status / notes; users notified via `SYSTEM` |

## Google OAuth2

1. In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth **Web application** client.
2. **Authorized JavaScript origins**: your Vite app, e.g. `http://localhost:5173`
3. **Authorized redirect URI**: must match Spring Security’s callback on the **same host and port as the backend**, for example:

`http://localhost:8080/login/oauth2/code/google`

The backend default port is **`8080`** (`server.port`, overridable with `SERVER_PORT`). It **must** match the redirect URI you register in Google.

4. Provide credentials via environment variables (recommended — **do not commit secrets**):

```powershell
$env:GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "your-client-secret"
```

5. The first Google user whose email equals `app.seed.admin-email` in `application.properties` is assigned **ADMIN**.

### If Google sign-in still fails

- Confirm **redirect URI** port = backend `server.port`.
- Confirm `VITE_API_ORIGIN` in `frontend/.env` points to that same backend origin (e.g. `http://localhost:8080`).
- If you ever pasted a **client secret** in chat or committed it to git, **rotate the secret** in Google Cloud and update your local env only.

## Run the backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API origin example: `http://localhost:8080` (see `server.port`).

## Run the frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Set `VITE_API_ORIGIN` (and optionally `VITE_API_BASE_URL`) in `.env` to the backend origin (same port as OAuth redirect / Spring).

## Authentication behaviour (for marking / documentation)

| Flow | Behaviour |
|------|------------|
| **Sign up (local)** | Requires **username** (3–32, `[a-zA-Z0-9_]`, stored lowercase), email, password. Role defaults to `USER`; self-service `ADMIN` is still available in the UI for demos—production systems would restrict that. |
| **Sign in (local)** | `POST /api/auth/login` with `usernameOrEmail` + `password`. Identifier may be **email** (contains `@`) or **username**. Spring Security still uses the **email** as the principal name after authentication so `/api/auth/me` and `/api/profile` stay consistent. |
| **Google** | Browser hits `/oauth2/authorization/google` on the backend; after success, user is redirected to `app.oauth2.success-redirect` (default: `{frontend}/oauth-success`). |
| **Roles** | `TECHNICIAN` is assigned by an **admin** under **User management**. Technicians use the **staff dashboard** (`/admin`) after login (same entry as admin, without user-management or support-queue UI unless `ADMIN`). |

## Notifications (for marking / documentation)

- **`SYSTEM`**: hub-wide / operational messages (support workflow, admin broadcasts). **Not** gated by ticket preference toggles.
- **`TICKET_STATUS` / `TICKET_COMMENT`**: reserved for a future ticketing integration; respect user preferences in `notification_preferences`.
- **REST**: `GET/POST /api/notifications`, `PATCH /api/notifications/{id}/read`, preferences under `/api/notifications/preferences`.

## Support / problem reports

| Endpoint | Who | Purpose |
|----------|-----|---------|
| `POST /api/support-requests` | Authenticated user | Submit subject + description |
| `GET /api/support-requests/mine` | Authenticated user | List own requests |
| `GET /api/support-requests` | **ADMIN** | List all |
| `PATCH /api/support-requests/{id}` | **ADMIN** | Set `status`, `adminNotes`; notifies user with a **SYSTEM** notification |

## Other authenticated APIs

- `GET /api/auth/me`, `POST /api/auth/login`, `POST /api/auth/signup`, password reset endpoints
- `GET/PATCH/DELETE /api/profile` (delete removes dependent rows then the user)
- `GET/PATCH /api/users/...` (**ADMIN**)

Session cookies: the frontend uses Axios with `withCredentials: true`.
