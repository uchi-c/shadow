import express, { Request, Response } from "express";
import path from "path";
import app from "./app.js";

// Long-running server entry point for local development (`npm run dev`) and
// persistent Node hosts (`npm start`). The Express app itself lives in app.ts
// and is shared with the Vercel serverless function (api/[...path].ts).
const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development Environment: Intercept assets through the Vite HMR middleware.
    // Imported here (never in app.ts) so `vite` stays out of the serverless bundle.
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
    console.log("[Dev Environment] Vite development sandbox mounted in Express middleware mode.");
  } else {
    // Production Environment: Serve pre-compiled files out of standard dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Production Environment] Express serving compiled assets natively from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Main Server] Shadow Root active. Navigating proxy requests to http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Critical Main Server bootstrap error:", err);
  process.exit(1);
});
