import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import leadHandler from "./api/lead.js";

/**
 * Dev-only middleware so the real `api/lead.js` endpoint works under
 * `npm run dev` (Vite's dev server doesn't run serverless functions).
 * It parses the JSON body and gives the Vercel-style handler the
 * `res.status().json()` shim it expects. In production this file is NOT
 * used — deploy `api/lead.js` to Vercel/Express as described in README.md.
 */
function devLeadApi() {
  return {
    name: "dev-lead-api",
    configureServer(server) {
      server.middlewares.use("/api/lead", (req, res) => {
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", async () => {
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = {};
          }
          const shim = {
            statusCode: 200,
            setHeader: (k, v) => res.setHeader(k, v),
            status(code) {
              this.statusCode = code;
              res.statusCode = code;
              return this;
            },
            json(obj) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(obj));
            },
          };
          await leadHandler(req, shim);
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load .env (incl. non-VITE_ vars) and expose the server-side lead vars to the
  // dev middleware via process.env, mirroring how a host like Vercel injects them.
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of ["RESEND_API_KEY", "LEAD_NOTIFY_TO", "LEAD_NOTIFY_FROM"]) {
    if (env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), devLeadApi()],
  };
});
