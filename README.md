# BudgetFlow

BudgetFlow is a full-stack budget management app built with Django REST Framework and React. It is designed as a polished portfolio project with secure authentication, category-based budgeting, transaction flows, and a clean dashboard.

## Why This Repo Exists

Ship a strong budgeting product that looks and feels modern while keeping the public repo focused on the app itself.


## Current Features

- JWT authentication with sign up, sign in, session refresh, and protected routes
- User-specific budget categories with balance tracking
- Deposit, withdraw, and transfer transaction flows
- Dashboard totals, recent activity, and chart-ready data
- Responsive React interface with reusable cards, forms, modals, and toasts
- Seeded starter categories for a smoother first-run experience

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT, CORS Headers
- Frontend: React, Vite, Recharts, Lucide React
- Data: SQLite for local development
- Auth flow: token-based SPA authentication

## Quick Start

### Backend

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
py manage.py migrate
py manage.py createsuperuser
py manage.py runserver
```

Backend URLs:

- API root: `http://127.0.0.1:8000/api`
- Admin: `http://127.0.0.1:8000/admin`

### Frontend

```powershell
cd frontend
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

Frontend URL:

- App: `http://localhost:5173` or `http://127.0.0.1:5173`

## Full Stack Run Order

1. Start the backend first from `backend/`.
2. Confirm `backend/.env` allows both `http://localhost:5173` and `http://127.0.0.1:5173` in CORS settings.
3. Start the frontend from `frontend/`.
4. Open `http://localhost:5173` or `http://127.0.0.1:5173`.
5. Create an account and test the auth, category, dashboard, and transaction flows.

## Reviewer Demo Flow

If you are testing the project for the first time:

1. Register a new account in the frontend.
2. Log in and review the seeded starter categories.
3. Create a deposit into one category.
4. Transfer funds to another category.
5. Review dashboard totals and recent transactions.
6. Open Django admin to inspect the data model if needed.

## Project Management

- Sprint issue roadmap: `docs/sprint-issues.md`
- Label catalog: `.github/labels.yml`
- Milestone catalog: `.github/milestones.yml`
- Issue forms: `.github/ISSUE_TEMPLATE/`

## Environment Variables

### Backend

Create `backend/.env` from the example file:

```env
SECRET_KEY=replace-me-with-a-secure-secret
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DB_NAME=db.sqlite3
```

### Frontend

Create `frontend/.env` from the example file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_CURRENCY=USD
```

`VITE_API_BASE_URL` is the critical connection point between the React frontend and Django backend.

## Project Structure

```text
.
|-- backend/
|   |-- manage.py
|   |-- requirements.txt
|   |-- config/
|   `-- apps/
|       |-- budget/
|       `-- users/
|-- frontend/
|   |-- package.json
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- context/
|       |-- pages/
|       `-- utils/
`-- .github/
```

## Testing

Current backend tests cover:

- registration with starter category seeding
- transfer balance movement between categories

Run backend tests with:

```powershell
cd backend
py manage.py test
```

If Django dependencies are not installed yet, follow the backend quick-start first.

## Deployment

The backend is designed for Render and the frontend for Vercel.

### Backend on Render

1. Push the repo to GitHub.
2. In Render, click **New > Blueprint** and point it at the repo. Render will read `render.yaml` and provision a web service plus a Postgres database.
3. After first deploy, set these env vars in the service's **Environment** tab (the yaml leaves them as `sync: false`):
   - `CORS_ALLOWED_ORIGINS=https://<your-vercel-domain>`
   - `CSRF_TRUSTED_ORIGINS=https://<your-vercel-domain>`
4. Optional: create a superuser via the Render shell: `python manage.py createsuperuser`.

### Frontend on Vercel

1. Import the repo in Vercel and set **Root Directory** to `frontend`.
2. `vercel.json` configures the Vite build and SPA rewrites automatically.
3. Add environment variable `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`.
4. Deploy. Update the backend's `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` with the resulting Vercel URL.

### Local Postgres (optional)

To run against Postgres locally instead of SQLite, set `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgres://USER:PASSWORD@127.0.0.1:5432/budgetflow
```

Leave it empty to fall back to SQLite.

## Known Gaps

- Frontend automated tests are not added yet
- Production media/demo links are not published yet
- Screenshot assets still need to be captured from a running app
