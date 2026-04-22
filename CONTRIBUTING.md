# Contributing to BudgetFlow

Thanks for contributing to BudgetFlow.

## Local Development

### Backend

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
py manage.py migrate
py manage.py runserver
```

### Frontend

```powershell
cd frontend
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

## Working Style

- Keep changes focused and easy to review.
- Prefer one meaningful improvement per commit.
- Use the daily sprint commit format when working through the public GitHub plan:
  - `day X: <clear outcome>`
- Update docs whenever setup, architecture, or user-facing behavior changes.

## Branching

For the 30-day visibility sprint, direct commits to `main` are acceptable when the change is small and self-contained. For larger features, use short-lived branches and open a pull request.

## Pull Requests

Good pull requests should include:

- a short summary of the change
- the reason for the change
- test notes
- screenshots when UI behavior changed

Use the pull request template in `.github/PULL_REQUEST_TEMPLATE.md`.

## Quality Bar

Before pushing:

- confirm the app still starts with the documented setup flow
- run relevant backend tests if you changed backend behavior
- review the manual QA checklist in `docs/MANUAL-QA-CHECKLIST.md` for UI or flow changes

## Documentation

Important project docs:

- `README.md`
- `docs/30-day-github-plan.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`
- `docs/CHANGELOG.md`

## Reporting Work

If you are using this repo to build GitHub presence:

- make the output visible
- tie each commit to one concrete improvement
- update the changelog or checklist whenever it improves clarity
