# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **take-home assignment**, not an existing application. As of this writing the
repo contains only the case brief and mock data under `recolour-case/` — no application
code has been scaffolded yet. The task is to build the app described in
`recolour-case/Technical description.rtf`.

When starting work, the first step is almost always scaffolding the project (see Required
stack below), after which this file should be updated with the real build/test/run
commands.

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
