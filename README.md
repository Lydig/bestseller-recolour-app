# Recolour Request Manager

A B2B **Recolour Workflow Tool** for managing requests that ask production partners to recolour product photos into specified Pantone colours or all-over-print (AOP) patterns. Built with **Vue 3, PrimeVue and Tailwind** on the front end and **Express + SQLite** on the back end, with an **Anthropic Claude**-powered parser that turns raw designer guidelines into structured tickets.

## Quick Start

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install        # installs root, backend and frontend dependencies
npm run dev        # starts API (http://localhost:3000) and web app (http://localhost:5173)
```

Open http://localhost:5173.

**Optional – real AI extraction.** Without a key, `/api/parse` returns a fixed mock result so the app still works. To test real extraction:

```bash
cp backend/.env.example backend/.env
# then set ANTHROPIC_API_KEY=... in backend/.env and restart `npm run dev`
```

`backend/.env` is git-ignored. Set `ANTHROPIC_MODEL` to override the default model (`claude-haiku-4-5-20251001`).

Other scripts: `npm run build` (production build of the frontend), `npm run copy-assets --prefix backend` (re-copy sample photos from `recolour-case/`).

## Architecture & Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vue 3 + Vite, vue-router | Mandated by the brief; fast dev loop |
| UI | PrimeVue (Aura theme) + Tailwind CSS 4 | Production-grade DataTable/Dialog/Card components, with Tailwind for layout and theming |
| Backend | Express | Mandated by the brief; small REST surface |
| Persistence | SQLite via `sqlite3` | Zero-config, file-based (`backend/data/app.db`), no database server to install; prebuilt binaries avoid native compilation on Windows |
| AI | `@anthropic-ai/sdk` | Natural-language extraction of structured data from free text |

```
backend/
  src/server.js        Express app, static files (/static), route mounting
  src/db.js            Schema, lightweight migrations, seed data
  src/routes/          tickets, kpis, partners, parse
  public/images/       Sample product photos served at /static/images
frontend/src/
  views/               Dashboard, Queue, Approved Library, Partner Overview
  components/          CreateTicketDialog (with AI auto-fill)
  stores/role.js       Operator / Manager toggle (no real auth)
```

In development Vite proxies `/api` and `/static` to the backend, so the frontend needs no CORS or URL configuration.

## Workflow Lifecycle

```
Pending ──send──▶ Sent ──partner returns──▶ Completed ──┬─ approve ─▶ Approved  (Approved Library)
                                                        └─ reject  ─▶ Rejected
```

| Status | Meaning | Action available |
|---|---|---|
| Pending | Ticket created, not yet sent | **Send to Partner** – simulated hand-off; returns a receipt (ID, partner, timestamp) |
| Sent | Partner has received the ticket | **Simulate Return** – stands in for the partner finishing the job |
| Completed | Partner delivered; awaiting review | **Approve** / **Reject** (Manager only) |
| Approved | Accepted; stored in the Approved Library | – |
| Rejected | Manager rejected the result | – |

(`In Progress` is also supported as a status for partner-side work and is counted as active in the Partner Overview.)

**Roles** (header dropdown, UI-only – there is no authentication):
- **Operator** – creates tickets (including AI auto-fill), sends them to partners, simulates returns.
- **Manager** – everything above except creation, plus approving/rejecting completed tickets.

**Views:** *Dashboard* (KPIs: tickets pending, tickets awaiting approval = `Completed`), *Queue* (filterable table with thumbnails and actions), *Approved Library* (photo cards), *Partner Overview* (tickets per partner: total, active, completed/approved).

## AI Solution Highlight: Guideline Extraction

**The bottleneck.** Each recolour request arrives as an unstructured designer note (see `recolour-case/Ticket*/Guideline.rtf`): item numbers, Pantone names, AOP patterns, and hard requirements such as "keep one clipping path" buried in prose. Operators had to read these and retype them into ticket fields by hand, which is slow and error-prone at volume.

**The solution.** In the *Create Ticket* dialog, paste the raw guideline into **Raw Guideline (AI Parsing)** and click **✨ Auto-Fill with AI**. The frontend calls `POST /api/parse` with `{ "text": "..." }`; the backend asks Claude to act as a data-extraction assistant and return strict JSON:

| Field | Extraction rule |
|---|---|
| `photo_id` | Main item number (typically 8 digits before the underscore, e.g. `15377489`) |
| `style` | Concise summary of the requested Pantone colours and AOP patterns |
| `priority` | One of Low / Normal / High / Urgent, defaulting to Normal |
| `partner` | Partner if explicitly mentioned, otherwise `Internal` |

The response is validated server-side (fenced output stripped, priority forced into the allowed set, partner defaulted), then used only to **pre-fill the form** – the operator reviews and edits before submitting, keeping a human in the loop. Without `ANTHROPIC_API_KEY` the endpoint returns a mock payload, and API failures surface as a clear error in the dialog rather than breaking ticket creation.

## Initial State

On a clean start (empty `Tickets` table) the database **self-seeds with the 4 case tickets** from `recolour-case/`, including their photos (`backend/public/images`):

| Photo ID | Style | Priority | Partner | Status |
|---|---|---|---|---|
| 15377489 | Granita solid; Fuchsia Fedora with AOP Block Libre | Normal | FastRetouch | Pending |
| 15377486 | Night Sky AOP White Dots; Hedge Green solid; Navy Blazer solid | High | PixelCraft | Sent |
| 15377488 | Hedge Green solid; Navy Blazer solid; Night Sky AOP White Dots | Normal | FastRetouch | Completed |
| 15377522 | Granita solid; Fuchsia Fedora with AOP Block Libre | Urgent | ColorLab | Approved |

So the dashboard starts at 1 pending / 1 awaiting approval. To reset, stop the app and delete `backend/data/app.db`.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/tickets?status=` | List tickets, optional status filter |
| POST | `/api/tickets` | Create ticket (`photo_id`, `style`, `partner`, optional `priority`, `image_url`) |
| PATCH | `/api/tickets/:id/status` | Update status |
| POST | `/api/tickets/:id/send` | Simulate sending to partner; returns `{ receiptId, partner, sentAt }` |
| GET | `/api/kpis` | `{ pending, awaitingApproval }` |
| GET | `/api/partners` | Per-partner totals (includes FastRetouch, PixelCraft, ColorLab, Internal) |
| POST | `/api/parse` | AI guideline extraction |

## Assumptions & Limitations
- Roles are a UI toggle only; the API is unauthenticated.
- Partner integration is simulated; "Simulate Return" stands in for the partner's callback.
- "Reject" sets status `Rejected`; rejected tickets are not yet re-sendable.
- The raw guideline text is used for extraction only and is not stored.
- Per-photo constraints from the guidelines (e.g. single clipping path) are not modelled as structured fields yet.

## Possible Next Steps
Re-send flow for rejected tickets, storing the raw guideline and all three photo views per ticket, structured colourway lines per style, real authentication, and automated tests.
