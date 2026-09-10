# FESTI

FESTI is a full-stack web app for discovering music festivals across Europe: take a short quiz to get a festival matched to your taste, browse and filter the full list, see everything on an interactive map and a month-by-month calendar, and chat with other festival-goers in a forum.

This started as a school project (originally in Romanian, plain HTML/CSS/JS). This version is a from-scratch rebuild: an English, typed, tested, full-stack application with a real API and database behind it.

## Features

- **Festival quiz** — answer three questions (genre, vibe, size) and the backend returns a matching festival.
- **Festival browser** — filter ~20 European festivals by genre, vibe and size; favorite the ones you like (persisted locally).
- **Interactive map** — every festival plotted on a Leaflet map, linking out to its official site.
- **Calendar** — festivals grouped by month, generated from the same dataset that powers the rest of the app.
- **Forum** — a simple message board backed by the API and a database.
- **Contact form** — sends a message to the backend, which stores it.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, React-Leaflet |
| Backend | Node.js, Express, TypeScript, `node:sqlite` |
| Testing | Vitest, Supertest, React Testing Library |

## Project structure

```
festi/
├── frontend/     React + Vite single-page app
├── backend/      Express REST API + SQLite database
└── legacy/       the original static HTML/CSS/JS version, kept for reference
```

## Getting started

Requires Node.js 22.5+ (for the built-in `node:sqlite` module).

```bash
npm run install:all   # installs both frontend and backend dependencies
npm run dev            # runs backend (:4000) and frontend (:5173) together
```

Then open http://localhost:5173.

Or run each side separately:

```bash
cd backend && npm install && npm run dev    # API on http://localhost:4000
cd frontend && npm install && npm run dev   # app on http://localhost:5173
```

The frontend reads the API URL from `VITE_API_URL` (see `frontend/.env.example`); it defaults to `http://localhost:4000`.

## Testing

```bash
npm test   # runs backend and frontend test suites
```

- Backend: API integration tests (Supertest) covering festival filtering, the quiz-matching endpoint, and forum validation.
- Frontend: unit tests for the calendar grouping logic and the favorites hook, plus a component test asserting that user-supplied content (e.g. a forum message) is rendered as text, never as HTML.

## API

| Method | Route | Description |
|---|---|---|
| GET | `/api/festivals` | List festivals, optionally filtered by `?genre=&vibe=&size=&featured=true` |
| GET | `/api/festivals/:id` | Get a single festival |
| POST | `/api/quiz/match` | Body `{ genre, vibe, size }` → best-matching festival |
| GET | `/api/forum` | List forum messages, newest first |
| POST | `/api/forum` | Body `{ name, message }` → posts a message |
| POST | `/api/contact` | Body `{ name, email, message }` → stores a contact request |

## What changed from the original

The original was four Romanian HTML pages that each duplicated the same ~300 lines of CSS/JS, hardcoded the festival list twice with inconsistent data, and rendered user-submitted forum text with `innerHTML` — a stored-XSS hole. This rebuild:

- Translates everything to English and merges the duplicated festival lists into one dataset served by a real API.
- Replaces copy-pasted markup with reusable React components.
- Fixes the XSS issue: React escapes rendered text by default, and the fix is covered by a test.
- Adds a typed backend with input validation instead of trusting whatever the client sends.
- Adds automated tests for the parts most likely to break silently (filtering, quiz matching, favorites).

## Possible next steps

- Add authentication so favorites sync across devices instead of living in `localStorage`.
- Swap SQLite for a hosted Postgres instance for production durability.
- Let organizers submit new festivals through an admin view instead of editing the seed file.

## Credits

Built by Aida Staicu & Alessia Tecu.
