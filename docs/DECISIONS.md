# BudgetFlow Architecture Decisions

## 1. Django REST Framework for the backend

BudgetFlow uses Django plus Django REST Framework because the project needs:

- user authentication
- clean model-driven APIs
- validation-heavy transaction flows
- a recognizable full-stack portfolio architecture

This keeps the backend readable and scalable without overcomplicating the v1 build.

## 2. React SPA for the frontend

The frontend is a React single-page app so the experience feels fast and product-like. This fits well with:

- protected routes
- dashboard-driven interactions
- modal-based flows
- API-driven state changes

## 3. JWT authentication

JWT auth is used because the frontend is a standalone SPA and needs a clean API boundary. Access and refresh tokens allow a straightforward local development flow while keeping user-specific data separated.

## 4. Category-balance model with transaction service logic

The project stores category balances directly and updates them through transaction service functions. This was chosen to keep the UX responsive and the core budgeting model easy to understand for a reviewer.

Tradeoff:

- direct balance storage is simple and clear for a portfolio project
- a more advanced finance system might use stricter ledger reconciliation rules everywhere

## 5. SQLite for local development

SQLite is the default database because it reduces setup friction for reviewers and makes the project easier to run quickly from a fresh clone.

## 6. Recharts for visual summaries

Recharts provides a clean way to render spending and cashflow visuals in the dashboard without adding too much front-end complexity.

## 7. Public GitHub presence as a first-class project goal

This repo is intentionally structured to support visible, daily progress:

- sprint planning docs
- issue templates
- changelog updates
- roadmap docs
- manual QA guidance

The repo is not just code storage; it is part of the final portfolio output.
