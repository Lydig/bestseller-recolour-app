# Recolour Request Manager

Take-home app for managing recolour requests sent to production partners.
Monorepo: **Vue 3 + Vite + PrimeVue + Tailwind** (`frontend/`) and **Express + SQLite** (`backend/`).

## Prerequisites
- Node.js 20+ and npm

## Run
```bash
npm run install:all   # installs root, backend and frontend dependencies
npm run dev           # starts both apps concurrently
```
- Frontend: http://localhost:5173 (proxies `/api` to the backend)
- Backend API: http://localhost:3000

The SQLite database is created automatically at `backend/data/app.db` on first start (git-ignored).

## API
| Method | Path | Description |
|---|---|---|
| POST | `/api/tickets` | Create ticket (`photo_id`, `style`, `partner`, optional `priority`) |
| GET | `/api/tickets?status=Pending` | List tickets, optional status filter |
| PATCH | `/api/tickets/:id/status` | Update status (`{ "status": "Completed" }`) |
| POST | `/api/tickets/:id/send` | Simulate sending to partner; marks `Sent` and returns a receipt |
| GET | `/api/kpis` | `{ pending, awaitingApproval }` |

Statuses: Pending, Sent, In Progress, Completed, Rejected.
Priorities: Low, Normal, High, Urgent.

## Notes
- The role dropdown (Operator / Manager) in the header is UI-only, with no authentication; the choice is kept in `localStorage`.
- "Awaiting approval" in the KPIs is defined as tickets with status `Completed` (finished by the partner, not yet approved).
- Queue, Approved Library and Partner Overview pages are placeholders for now.
