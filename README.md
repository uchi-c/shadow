# Shadow Root Security Technologies

[![CI](https://github.com/uchi-c/shadow/actions/workflows/ci.yml/badge.svg)](https://github.com/uchi-c/shadow/actions/workflows/ci.yml)

Marketing site + lead platform for Shadow Root Security Technologies (Lusaka, Zambia):
a React 19 + Vite single-page app with an Express API that runs as a Vercel
serverless function. Includes the Kuma AI concierge (Google Gemini + a RAG
knowledge base), a Supabase-backed lead/chat datastore, an admin portal, and a
suite of free, in-browser security tools.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` (or `.env.local`) and fill in the values you need.
   Only `GEMINI_API_KEY` is required for the AI concierge; the rest are optional
   locally (see below).
3. Run the app: `npm run dev`

Other scripts: `npm run build` (Vite build + esbuild server bundle),
`npm start` (serve the production build), `npm run lint` (`tsc --noEmit`).

## Environment variables

All configuration is via environment variables — see [`.env.example`](.env.example)
for the full list with inline notes. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini key powering the Kuma AI concierge. |
| `ADMIN_PASSWORD` | No | Password for the admin portal (defaults to a placeholder). |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | No | Client-side Supabase auth (browser). Anon key only. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | On Vercel | Server-side durable storage for leads/chats/knowledge. The filesystem is read-only on Vercel, so Supabase is required there. Service-role key is secret — never prefix with `VITE_`. |
| `NVD_API_KEY` | No | Raises the rate limit for the CVE Explorer tool. |

### CVE Explorer & `NVD_API_KEY`

The Tools page includes a **CVE Explorer** that looks up live vulnerabilities from
the NIST National Vulnerability Database (NVD) via the server-side `/api/cve`
proxy (keyword search or a specific CVE id). NVD's public API allows roughly
**5 requests / 30s per IP**; setting `NVD_API_KEY` raises that to about
**50 / 30s**, which matters on serverless hosts where an egress IP is shared.

The tool works without a key — under throttling it simply shows a "feed busy"
message rather than failing. To add one:

1. Request a free key: <https://nvd.nist.gov/developers/request-an-api-key>
2. Add `NVD_API_KEY` as a **server-side** environment variable (locally in `.env`,
   or on Vercel under Project → Settings → Environment Variables → Production).
3. Redeploy so the serverless function picks it up. The endpoint sends it to NVD
   as the `apiKey` header automatically — no code change needed.

## Testing

`npm test` runs the Playwright suite (`tests/`) against the real production
build (compiled Vite output + the Express app), so it exercises real
code-splitting and chunk behavior — not the dev server's Vite middleware.
Covers navigation (desktop + mobile), accessibility (axe-core, zero
violations required), responsive layout, the security tools, the quote-form
prefill flow, and the chunk-load error boundary. `npm run test:ui` opens
Playwright's interactive UI mode for debugging.

CI (`.github/workflows/ci.yml`) runs lint, build, and the full test suite on
every push to `main` and every pull request against it.

## Deployment

Deployed on Vercel: the SPA is served as static output and the Express app runs as
a serverless function (`api/[...path].ts`). See `vercel.json` for the build and
routing configuration.
