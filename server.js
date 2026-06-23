/**
 * Production server for Apex Appliance Solutions (Node / VPS deploy).
 *
 * Serves the built static site (dist/) AND mounts the secured lead-capture
 * endpoint, so the whole app runs from one Node process. Intended to sit
 * behind a reverse proxy (nginx) that terminates HTTPS — see DEPLOY.md.
 *
 *   1. npm install            # install deps
 *   2. npm run build          # produce dist/
 *   3. npm start              # run this server (reads .env if present)
 *
 * Env vars (set in .env or your process manager):
 *   PORT                 — port to listen on (default 3000)
 *   RESEND_API_KEY       — enables lead email (see api/lead.js)
 *   LEAD_NOTIFY_TO       — inbox that receives leads
 *   LEAD_NOTIFY_FROM     — verified Resend sender
 */
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expressLead } from "./api/lead.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const PORT = process.env.PORT || 3000;

const app = express();

// Behind nginx, the real client IP arrives via X-Forwarded-For (which the lead
// throttler reads). Trusting the proxy also makes req.ip correct if needed.
app.set("trust proxy", true);

// Parse JSON bodies (small — the lead form is tiny). Only affects requests
// that actually send JSON, so static asset requests are unaffected.
app.use(express.json({ limit: "16kb" }));

// Secured lead capture: idempotency key + rate limit + per-IP throttle + email.
app.post("/api/lead", expressLead);

// Any other /api route → 404 JSON (don't fall through to the SPA).
app.all("/api/*", (req, res) => res.status(404).json({ error: "Not found" }));

// Serve the built static site with long-lived caching for hashed assets.
app.use(
  express.static(distDir, {
    maxAge: "1y",
    setHeaders(res, filePath) {
      // index.html must not be cached so deploys are picked up immediately.
      if (filePath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// Single-page app fallback: serve index.html for any non-API GET.
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Apex Appliance Solutions listening on http://127.0.0.1:${PORT}`);
});
