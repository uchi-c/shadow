// Vercel serverless entry point.
//
// The whole Express application (routes + middleware) is defined in app.ts and
// exported as its default. app.ts deliberately imports NO dev-only tooling
// (no vite, no static-file server), so it bundles cleanly into a function.
// Vercel's Node runtime accepts an Express app directly as a request handler,
// so every request to /api/* is dispatched into the app.
import app from "../app";

export default app;
