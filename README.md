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

- App: `http://localhost:5173`

## Full Stack Run Order

1. Start the backend first from `backend/`.
2. Confirm `backend/.env` allows `http://localhost:5173` in CORS settings.
3. Start the frontend from `frontend/`.
4. Open `http://localhost:5173`.
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
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
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

## Known Gaps

- Frontend automated tests are not added yet
- Deployment config is planned but not completed yet
- Production media/demo links are not published yet
- Screenshot assets still need to be captured from a running app
