# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A **take-home assignment** (brief in `recolour-case/Technical description.rtf`), now fully
built: a recolour-request workflow tool. Monorepo with an Express + SQLite backend and a
Vue 3 frontend. Use plain `sqlite3`, never `better-sqlite3` (native build issues on Windows).

## Layout

```
package.json          root scripts (concurrently); postinstall installs backend + frontend
backend/
  src/server.js       Express app: cors, json, /static, route mounting, /api 404, error handler
  src/db.js           sqlite3 helpers (run/get/all), schema, column migrations, seeding
  src/routes/         tickets.js, kpis.js, partners.js, parse.js
  public/images/      sample photos (*_001.jpg) served at /static/images
  scripts/copy-assets.js   copies photos from recolour-case/ into public/images
  data/app.db         SQLite file (git-ignored, auto-created)
frontend/src/
  main.js, router.js  PrimeVue (Aura) + Tailwind 4 setup; routes /, /queue, /approved, /partners
  api.js              fetch wrappers for every endpoint
  stores/role.js      Operator/Manager ref, persisted in localStorage (no auth)
  utils.js            formatDate (SQLite UTC timestamps)
  views/              Dashboard, Queue, Approved, Partners
  components/CreateTicketDialog.vue   create form + "Auto-Fill with AI"
recolour-case/        brief and mock data (read-only input)
```

## Commands

- `npm install` (root) – installs root, backend and frontend deps
- `npm run dev` (root) – API on :3000, Vite on :5173 (proxies `/api` and `/static`)
- `npm run build` (root) – frontend production build
- `npm run copy-assets --prefix backend` – refresh sample photos
- No test suite. Reset data by deleting `backend/data/app.db` (re-seeds on next start).

## Environment (`backend/.env`, git-ignored, see `.env.example`)

- `ANTHROPIC_API_KEY` – optional; when unset `/api/parse` returns a hardcoded mock. Never print or commit it.
- `ANTHROPIC_MODEL` – optional; default `claude-haiku-4-5-20251001`.
- `PORT` – optional; default 3000.

## Database schema

- `Tickets(id, photo_id, style, priority, partner, status, created_at, updated_at, image_url)`
  – `status` default `Pending`, `priority` default `Normal`; `updated_at` is set on every status
  change and doubles as the approval date. Missing columns are added by migration in `init()`.
- `Users(id, role UNIQUE)` – seeded with Operator, Manager (not used by the API yet).
- Seeding: if `Tickets` is empty, the 4 case tickets are inserted (Pending, Sent, Completed, Approved).

## Backend endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/tickets?status=` | filter validated against the status list |
| POST | `/api/tickets` | requires `photo_id`, `style`, `partner`; optional `priority`, `image_url` |
| PATCH | `/api/tickets/:id/status` | body `{status}` |
| POST | `/api/tickets/:id/send` | sets `Sent`; returns `{success, receipt:{receiptId, partner, sentAt}, ticket}` |
| GET | `/api/kpis` | `{pending, awaitingApproval}` (awaiting = `Completed`) |
| GET | `/api/partners` | `{partner,total,active,done}`; always includes FastRetouch, PixelCraft, ColorLab, Internal |
| POST | `/api/parse` | body `{text}` → `{photo_id, style, priority, partner}` via Claude |

Statuses: Pending, Sent, In Progress, Completed, Rejected, Approved. Priorities: Low, Normal, High, Urgent.
Flow: Pending → Sent → Completed → Approved/Rejected. Operator creates/sends/returns; Manager
approves/rejects (Completed tickets only), enforced in the UI only.

## The assignment

Build a small app to manage **recolour requests** — tickets that ask a production partner
to recolour product photos into specified Pantone colours / all-over-print (AOP) patterns.
Target as many of these as possible (from the brief):

1. **Recolour Ticket Creation** — form with photo ID, style, priority, and partner.
2. **Ticket Queue** — list all tickets with status (Pending, Sent, In Progress, Completed, Rejected) and filters.
3. **Partner Integration** — simulate sending tickets to partners and show receipt status.
4. **Approval & Storage** — approve → store in "Approved Photos"; reject → return to queue.
5. **Navigation** — main menu + sidebar (Queue, Approved Library, Partner Overview).

Nice-to-have: role-based views (Operator creates tickets, Manager approves); a KPI
dashboard (e.g. "10 tickets pending", "3 awaiting approval").

## Required stack (mandated by the brief — do not substitute)

- **Frontend:** Vue 3
- **Backend:** Express

Design/styling and all other choices (build tooling, state management, persistence,
TypeScript vs JS) are open. A simulated/in-memory backend is acceptable — "Partner
Integration" is explicitly a *simulation* of sending tickets and receiving receipt status.

## Mock data: `recolour-case/`

The four `Ticket N/` folders are the sample inputs the domain model should accommodate.
Each ticket folder contains:

- Product photos named `<styleId>_<colorId>_<NNN>.jpg` where `NNN` is a view (`001`, `002`, `007`).
  All three views of a style share one recolour instruction.
- A reference swatch image for AOP patterns (e.g. `Block Libre.jpg`, `DOTS CLOUD DANCER.jpg`).
- `Guideline.rtf` / `Guideline.pdf` — the partner's recolour instructions for that ticket.

**Domain facts to encode** (derived from the guidelines):

- A ticket targets a style ID (e.g. `15377489`) across its `001/002/007` views.
- A recolour instruction is either a **solid Pantone colour** (e.g. "Granita -solid",
  "Hedge Green -solid", "Navy Blazer -solid") or a **Pantone colour + AOP pattern**
  (e.g. "Fuchsia Fedora, AOP Block Libre"; "Night Sky, AOP White Dots").
- One style can have multiple requested colourways (Ticket 2 and 3 each request three).
- A recurring hard requirement: **keep the clipping path for all pictures, but only one
  clipping path.** This is a per-photo processing constraint worth surfacing in the ticket model/UI.

`.rtf` files are the authoritative source for instructions; the `.pdf` and image files are
binary and can't be read directly — parse the `.rtf` text or treat images as opaque assets.
`.DS_Store` files are macOS cruft and should be gitignored.

## Note on reading the brief

The source documents are RTF. Read the raw `.rtf` and mentally strip the control words
(`\f0`, `\fs26`, `\cf2`, `\'92` = curly apostrophe, `\'a0` = non-breaking space, etc.) —
the plain text is interleaved with formatting codes.
