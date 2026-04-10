# Smart Campus Operations Hub — Member 4 module

This slice of the Smart Campus project implements **Google OAuth authentication**, **in-app notifications** (with preferences), and **admin user / role management**. It matches the backend entities under `backend/src/main/java/com/campus/hub` (auth, notification, user packages).

## Prerequisites

- **JDK 21** (project `pom.xml` targets Java 21)
- **MySQL** 8.x (server running locally or reachable from your machine)
- **Node.js** 20+ (for the Vite frontend)

## MySQL setup

1. Start MySQL and ensure you can log in (e.g. MySQL Workbench, `mysql` CLI, or XAMPP).
2. Create a user/password if needed. The app connects to database **`campus_hub`** (created automatically if the JDBC URL includes `createDatabaseIfNotExist=true`).
3. Configure credentials (defaults in `backend/src/main/resources/application.properties` are **`root`** with an **empty password**). If your MySQL `root` password is not empty, set environment variables before starting the backend, for example in PowerShell:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
```

You can instead set `DB_URL` to a full JDBC URL if required.

4. **Tables** (for assignments / ERD documentation): see `backend/src/main/resources/db/schema-reference.sql`. Runtime: Hibernate `ddl-auto=update` creates or updates tables from the JPA entities.

| Table | Purpose |
|--------|---------|
| `users` | OAuth users: name, email, role (`USER` / `ADMIN`), provider, enabled, timestamps |
| `notifications` | Per-user notifications: category, title, message, read flag, optional reference |
| `notification_preferences` | Per-user toggles for ticket status / ticket comment categories |

## Google OAuth

Register an OAuth client in [Google Cloud Console](https://console.cloud.google.com/) (Web application). Authorized redirect URI must include:

`http://localhost:8081/login/oauth2/code/google`

Then set (PowerShell example):

```powershell
$env:GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "your-secret"
```

The first user matching `app.seed.admin-email` in `application.properties` is promoted to **ADMIN**.

## Run the backend (VS Code or terminal)

1. Open the folder `backend` (or the repo root) in VS Code.
2. Install the **Extension Pack for Java** if you want Run/Debug on `CampusHubApplication`.
3. In a terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API base URL: `http://localhost:8081` (this project uses **8081** by default to avoid conflicts). If you see **Access denied for user 'root'**, fix MySQL username/password via `DB_USERNAME` / `DB_PASSWORD` as above.

## Run the frontend (VS Code or terminal)

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

App URL: `http://localhost:5173`. Ensure `VITE_API_ORIGIN` in `.env` points at the backend (default `http://localhost:8081`).

## API overview (Member 4)

- **Auth (session + OAuth):** `GET /api/auth/me` (authenticated)
- **Notifications:** `GET/POST /api/notifications`, `PATCH /api/notifications/{id}/read`, preferences under `/api/notifications/preferences`
- **Users (admin):** `GET /api/users`, `PATCH /api/users/{id}/role`

The browser uses **session cookies** (`withCredentials: true`); sign-in redirects to Google via `/oauth2/authorization/google`.
