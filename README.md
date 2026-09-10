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
- **Trip planner** — on each festival's detail page, search live flight prices (via the [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper) API on RapidAPI) from a departure airport to the festival's nearest airport, plus a one-click deep link out to Skyscanner (flights) or Booking.com (hotels) to complete the booking.

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

To get live flight prices in the trip planner: sign up free at [rapidapi.com](https://rapidapi.com), open the [Sky Scrapper](https://rapidapi.com/apiheya/api/sky-scrapper) listing, subscribe to the BASIC ($0.00/mo) plan, and put your key in `backend/.env` as `RAPIDAPI_KEY` (see `backend/.env.example`). Without a key, the planner still works — it shows a note and falls back to a Skyscanner search link. Hotel prices aren't wired to a live provider yet (see "What's not done" below) — that side always shows a Booking.com search link.

## Testing

```bash
npm test   # runs backend and frontend test suites
```

- Backend: API integration tests (Supertest) covering festival filtering, the quiz-matching endpoint, forum validation, and the travel routes (including a mocked Sky Scrapper flight-search flow, so the suite never needs real API credentials).
- Frontend: unit tests for the calendar grouping logic, the trip-date helper, and the favorites hook, plus a component test asserting that user-supplied content (e.g. a forum message) is rendered as text, never as HTML.

## API

| Method | Route | Description |
|---|---|---|
| GET | `/api/festivals` | List festivals, optionally filtered by `?genre=&vibe=&size=&featured=true` |
| GET | `/api/festivals/:id` | Get a single festival |
| POST | `/api/quiz/match` | Body `{ genre, vibe, size }` → best-matching festival |
| GET | `/api/forum` | List forum messages, newest first |
| POST | `/api/forum` | Body `{ name, message }` → posts a message |
| POST | `/api/contact` | Body `{ name, email, message }` → stores a contact request |
| GET | `/api/travel/flights` | Query `festivalId, origin, departureDate, returnDate?, adults?` → live flight offers (Sky Scrapper) + a Skyscanner search link |
| GET | `/api/travel/hotels` | Query `festivalId, checkInDate, checkOutDate, adults?` → always `offers: []` for now + a Booking.com search link (see "What's not done") |

## What changed from the original

The original was four Romanian HTML pages that each duplicated the same ~300 lines of CSS/JS, hardcoded the festival list twice with inconsistent data, and rendered user-submitted forum text with `innerHTML` — a stored-XSS hole. This rebuild:

- Translates everything to English and merges the duplicated festival lists into one dataset served by a real API.
- Replaces copy-pasted markup with reusable React components.
- Fixes the XSS issue: React escapes rendered text by default, and the fix is covered by a test.
- Adds a typed backend with input validation instead of trusting whatever the client sends.
- Adds automated tests for the parts most likely to break silently (filtering, quiz matching, favorites).

## What's not done

- **Hotel prices aren't live.** No self-serve hotel-pricing API has been verified end-to-end yet (Amadeus's free self-service tier was decommissioned; a couple of RapidAPI options exist but weren't confirmed against a real response before shipping this). The hotels endpoint is honest about this: it always returns `configured: false` and a working Booking.com search link, rather than guessed/untested code pretending to return real prices.
- **Live flight prices aren't showing yet, and it's now a confirmed API limitation, not a guess.** Airport lookup (`searchAirport`) works and is verified against live calls. `searchFlights`, however, doesn't return itineraries synchronously — it kicks off an async search session (`{ data: { context: { sessionId, status: "complete" } } }`, no results) the way real-time flight scrapers typically do. There's presumably a second "poll for results" endpoint, but it isn't in the docs available without a RapidAPI account login. Until that's found, the flights tab always falls back to the Skyscanner search link — safely, not with an error.

## Possible next steps

- Find Sky Scrapper's results-polling endpoint (via their RapidAPI account's interactive tester) and wire it into `searchFlights` in `skyscanner.ts`.
- Wire up a verified hotel-pricing provider (or drop the "Hotels" tab if one never materializes).
- Add authentication so favorites sync across devices instead of living in `localStorage`.
- Swap SQLite for a hosted Postgres instance for production durability.
- Let organizers submit new festivals through an admin view instead of editing the seed file.
- Cache Sky Scrapper responses (same route/query) for a few minutes to stay well under the free-tier rate limit.

**Note on Skyscanner/Booking.com:** neither offers a self-serve public API — both require an approved business partnership (Amadeus's free self-service developer tier, which this project first targeted, was also decommissioned). The trip planner instead uses Sky Scrapper (a Skyscanner-data wrapper on RapidAPI) for real flight price data, and links out to Skyscanner/Booking.com's own search pages to complete a booking, rather than pretending to integrate with APIs that aren't actually open.

## Credits

Built by Aida Staicu & Alessia Tecu.
