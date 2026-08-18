# ESKAN Real Estate — Web Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The public web application for the ESKAN real estate platform (graduation project). Built with **Next.js 14 (App Router)** and **React 18**, using **ISR (Incremental Static Regeneration)** with tag-based on-demand cache revalidation. It talks to the **Express + MongoDB** backend (`../backend`) for authentication, property discovery, chat, notifications, and content.

## Project Repositories

ESKAN is split across four repositories that all share the single backend API and one MongoDB database.

| Component | Repository | Local directory | Stack |
|---|---|---|---|
| Backend API | [eskan-real-estate-backend](https://github.com/AbbasSk2004/eskan-real-estate-backend) | `backend/` | Node.js, Express 4, MongoDB (Mongoose 7) |
| **Web platform** &nbsp;`you are here` | [Eskan_Real_Estate_Web](https://github.com/AbbasSk2004/Eskan_Real_Estate_Web) | `real-estate-react/` | Next.js 14 (App Router), React 18 |
| Admin panel | [react-real-estate-admin-panel](https://github.com/AbbasSk2004/react-real-estate-admin-panel) | `admin-panel/` | React 18, MUI 5, Chart.js |
| Mobile app | [React-Native-real-estate-mobile-app](https://github.com/AbbasSk2004/React-Native-real-estate-mobile-app) | `real_estate/` | Expo SDK 53, React Native 0.79 |

Clone them as **siblings in one parent directory** so the relative paths used throughout these docs (`../backend`, `../real-estate-react`) resolve:

```bash
mkdir eskan && cd eskan
git clone https://github.com/AbbasSk2004/eskan-real-estate-backend.git backend
git clone https://github.com/AbbasSk2004/Eskan_Real_Estate_Web.git real-estate-react
git clone https://github.com/AbbasSk2004/react-real-estate-admin-panel.git admin-panel
git clone https://github.com/AbbasSk2004/React-Native-real-estate-mobile-app.git real_estate
```

All three clients authenticate against the same `/api/auth` endpoints and read the same property data, so **a change to any backend response shape affects all three**. The property payload in particular is served in both camelCase and snake_case (see `toResponse` in `backend/services/property.service.js`) specifically to keep older mobile and web clients working — do not remove alias fields without checking every client.

## Core Capabilities

- Property discovery with search, filters, and type pages
- Featured properties, testimonials, and FAQs
- User registration/login with email OTP verification, password reset
- Profile management: saved favorites, user properties
- 1:1 chat and real-time in-app notifications
- **Personalized recommendations** — the homepage carousel is ranked per visitor by the backend, and works for logged-out guests too ([details](#personalized-recommendations))
- Similar properties on each listing page (same property type)
- Phone/email contact workflows and legal pages (privacy, terms, cookies)
- SEO: per-page metadata, Open Graph, JSON-LD (properties, FAQs), `sitemap.xml`, `robots.txt`

## Technology Stack

- **Framework:** Next.js 14 App Router, React 18, React Server Components
- **Data fetching:** Server-side fetch with ISR (`revalidate: 3600`) + tag-based cache keys
- **UI:** Bootstrap 5, React Bootstrap, React Slick, react-markdown, animate.css
- **State/API:** Context API, Axios (client), native `fetch` (server)
- **Backend (shared):** Express + MongoDB (Mongoose), JWT auth — see `../backend/README.md`
- **Realtime:** `ws://<backend>/ws` WebSocket + SSE notification stream
- **Deployment:** Netlify (`netlify.toml`), Docker-ready

## Prerequisites

- Node.js >= 18 (npm >= 9)
- The backend running locally (see `../backend/README.md`) — defaults to `http://localhost:3001/api`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` (values below). The app reads these at **build time** (`NEXT_PUBLIC_*` is inlined into the client bundle):

```env
# Backend configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# On-demand ISR revalidation secret (must be set in production)
# REVALIDATION_SECRET=change-me
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:3001/api` | REST API base URL |
| `NEXT_PUBLIC_WS_URL` | no | `ws://localhost:3001` | WebSocket server URL |
| `NEXT_PUBLIC_SITE_URL` | no | `http://localhost:3000` | Public site origin (canonical URLs, sitemap) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | no | — | Google Maps key for map features |
| `REVALIDATION_SECRET` | prod | — | Secret protecting `/api/revalidate` on-demand ISR |
| `API_BASE_URL` | no | `http://localhost:3001/api` | Server-side-only API base (used by `lib/api.js`) |

The backend must be started separately: `npm --prefix ../backend run dev` (or `npm run server` from this directory).

### 3. Run

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run server   # backend only (http://localhost:3001)
```

The backend CORS allow-list automatically includes `http://localhost:3000` in development, so no extra config is needed locally.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js development server (port 3000) |
| `npm run build` | Production build (Next.js) |
| `npm start` | Production server after `build` (port 3000) |
| `npm run lint` | ESLint (`next lint`) over the project |
| `npm run format` | Prettier over `src/**/*.{js,jsx,json,css,md}` + `app/**/*` |
| `npm run server` | Start the backend in development mode (`npm --prefix ../backend run dev`) |
| `npm run install-all` | Install web + backend dependencies |

## Project Structure

```text
real-estate-react/
├── app/                     # Next.js App Router routes
│   ├── page.js              # Home (server component, ISR)
│   ├── layout.js            # Root layout: metadata, Navbar, Footer, AppProviders
│   ├── properties/          # List, type pages, property detail ([id])
│   ├── about/ contact/ help/ privacy/ terms/ cookies/
│   ├── login/ register/ verify-otp/ forgot-password/ reset-password/
│   ├── profile/ add-property/ settings/cookies/
│   ├── api/revalidate/      # On-demand ISR endpoint (tags + paths)
│   ├── sitemap.ts           # Dynamic sitemap (properties, static routes)
│   └── robots.ts
├── lib/
│   └── api.js               # Server-only data layer (fetch + ISR tags) — NEVER client-import
├── src/
│   ├── components/          # Feature components (auth, chat, profile, properties,
│   │                        #   home, notifications, layout, legal, contact, common)
│   ├── services/            # Client API clients (api, auth, propertyService, chat, ...)
│   ├── context/             # AuthContext, ChatContext, NotificationContext, ...
│   ├── hooks/               # useAuth, useChat, useFavorites, useNotifications, ...
│   ├── utils/               # formatters, cookieUtils, imageUtils, constants, ...
│   ├── constants/           # lebanonLocations, ...
│   └── assets/              # css/ (component styles), img/
├── public/                  # Static assets, img/, favicon, _redirects
├── netlify.toml             # Netlify build/publish config + Next.js headers
└── .env.example
```

## ISR & Cache Revalidation

Every public read through `lib/api.js` is cached with **tag-based ISR**:

- `revalidate: 3600` — pages self-refresh at most once per hour.
- Cache tags: `properties`, `property-<id>`, `faqs`, `testimonials`, `type-<type>`, `home`.
- **On-demand revalidation** — after any content change, the backend or admin panel calls:

```http
GET /api/revalidate?secret=<REVALIDATION_SECRET>&tag=properties
GET /api/revalidate?secret=<REVALIDATION_SECRET>&tag=property-<id>&path=/properties/<id>
```

Multiple `tag`/`path` parameters may be repeated. Unknown tags and missing/invalid secrets are rejected.

**Server/Client split:** `lib/api.js` and `app/api/revalidate/route.js` contain server-only code. Never import `lib/api.js` from a Client Component (`'use client'`).

### What is deliberately NOT cached

The homepage recommendation carousel is **excluded from ISR**. `app/page.js` renders `<PropertyCarousel />` with no `initialProperties`, and `homeApi.data()` does not fetch `/properties/recommended` at all.

This is intentional, not an oversight. ISR caches one HTML payload per `revalidate` window and serves it to every visitor, so a pre-rendered recommendation list would be identical for everyone — and `PropertyCarousel` skips its client fetch entirely when handed `initialProperties`. Rendering client-side is what lets the request carry the `visitor_id` / session cookies the backend ranks on. The backend also returns `Cache-Control: private, no-store` on that endpoint so no CDN can pool one visitor's results.

`featured` and `testimonials` remain ISR-cached — they are the same for everyone.

## Personalized Recommendations

The homepage carousel is ranked per visitor by the backend. **It personalizes for logged-out guests as well as signed-in users**, which is the main behavioural difference from the previous build (where every visitor saw the same admin-flagged list).

### How a guest gets personalized

1. On the first request to `GET /api/properties/recommended`, the backend sets a 1-year HttpOnly `visitor_id` cookie.
2. Opening any listing calls `storeViewedProperty()` in `src/services/recommendation.js`, which POSTs to `/api/properties/:id/views`. That POST carries the `visitor_id` cookie (`withCredentials: true` on the axios client).
3. From the second listing onward the carousel is ranked against that browsing history — no login required.

`storeViewedProperty()` is the single funnel for "user opened a listing" (all three `PropertyDetail` code paths call it). It writes localStorage **and** reports server-side; the localStorage copy alone cannot personalize anything, because ranking happens on the server.

The POST is fire-and-forget and releases its dedup guard on failure, so a telemetry error never surfaces to the user or blocks rendering. `/properties/*/views` is listed in `axiosClient.publicEndpoints`, so the 401-refresh interceptor correctly ignores it.

### Reading the response

```json
{ "success": true, "data": [ ... ], "source": "personalized", "personalized": true }
```

`source` is `personalized` (history exists), `trending` (cold start), or `curated` (backend fallback). `PropertyCarousel` surfaces it as a small label next to the section heading. Each property also carries additive `match_score` (0–100) and `recommendation_reason` fields.

Full algorithm — signal weights, similarity functions, the multiplicative budget gate, and the MMR diversity pass — is documented in [the backend README](https://github.com/AbbasSk2004/eskan-real-estate-backend#recommendation-engine).

### Expect a spinner on first load

Because this slot is not pre-rendered, first paint shows `PropertyCarousel`'s spinner while the request completes. The backend caches rankings for 45 s per visitor, so navigations within a session are instant. Cold-call latency is dominated by MongoDB round-trip time, not by the ranking itself.

## Backend Integration

- **API (client):** configured axios client in `src/services/axiosClient.js` (base URL from `NEXT_PUBLIC_API_URL`, JWT injection + silent refresh); domain services in `src/services/*.service.js` (`profile`, `contact`, `testimonials`, `views`, `favorites`, `notifications`, `propertyService`, `chat.service`, `notificationService`, `faqService`, `auth`, ...) each own their endpoints
- **API (server):** `lib/api.js` — used by RSC pages for ISR-cached data
- **Auth:** JWT access + refresh tokens via `authStorage`; `PrivateRoute` (client component) guards `/profile` and `/add-property`
- **Realtime:** `src/services/websocket.js` connects to `NEXT_PUBLIC_WS_URL` (path `/ws`, token query param); notifications also consumed via the SSE stream endpoint
- **Media:** images uploaded through the backend's Cloudinary pipeline and served via returned URLs

## Deployment

### Netlify

`netlify.toml` builds with `npm run build`. Set `NEXT_PUBLIC_*` and `REVALIDATION_SECRET` in the Netlify dashboard (build-time). Next.js output (`/.next`) is served directly; SPA redirects are handled by Next.js routing.

### Docker / standalone

```bash
docker-compose up -d --build      # or: docker build -t eskan-web . && docker run -p 3000:3000 eskan-web
```

The image uses Next.js **standalone** output (`output: 'standalone'` in `next.config.js`) and runs a non-root node server on port 3000. Pass `NEXT_PUBLIC_*` and `REVALIDATION_SECRET` via build args (`Dockerfile.production`) and runtime env (`docker-compose.yml`).

```bash
npm run build
npm start   # runs `next start` on port 3000
```

### Production backend

The frontend points at a production backend via build-time env vars (e.g. `NEXT_PUBLIC_API_URL`). The production value is set in the deployment environment and intentionally not published here.

## Troubleshooting

- **CORS errors** — origin mismatch between the frontend and the backend allow-list (`ALLOWED_ORIGINS` / `FRONTEND_URL` in `../backend/.env`).
- **401s after login** — JWT secret mismatch or an expired access token; the app should rotate via `/api/auth/refresh`.
- **Image upload failures** — Cloudinary credentials missing on the backend.
- **Stale pages** — pages are ISR-cached (up to 1h). Hit `/api/revalidate?secret=...&tag=...` to purge, or rebuild.
- **Server-component data errors** — RSC pages catch API failures and degrade to client-side fetching inside components (props like `initialProperties`).

## License

MIT — see [LICENSE](LICENSE).