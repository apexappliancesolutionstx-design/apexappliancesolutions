/**
 * api/lead.js — secured lead-capture endpoint for Apex Appliance Solutions.
 *
 * Implements the three protections requested:
 *   1. Idempotency key  — duplicate submissions (double-click, retries, flaky
 *                          networks) resolve to the SAME result instead of
 *                          creating duplicate leads.
 *   2. Rate limiting     — a global token-bucket cap on total requests/minute.
 *   3. Per-IP throttling — a sliding window so one IP can't flood the form.
 *
 * Works as a Vercel / Next.js API route (default export) OR an Express handler
 * (named `expressLead`). The store is in-memory for demo purposes — see the
 * "PRODUCTION" notes to swap in Redis / Upstash so limits hold across instances.
 */

/* ───────────────────────── Tunable config ───────────────────────── */

const CONFIG = {
  // Per-IP sliding window
  ipWindowMs: 60_000,        // 1 minute
  ipMaxPerWindow: 5,         // max 5 submissions per IP per minute

  // Global token bucket (protects the whole endpoint / downstream CRM)
  globalCapacity: 60,        // burst capacity
  globalRefillPerSec: 1,     // tokens added back per second (≈60/min)

  // Idempotency
  idempotencyTtlMs: 10 * 60_000, // remember a key's result for 10 minutes

  // Housekeeping
  sweepEveryMs: 5 * 60_000,
};

/* ───────────────────────── In-memory stores ─────────────────────────
 * PRODUCTION: replace each Map with Redis. The IP window becomes
 * `INCR`+`EXPIRE` (or a sorted-set sliding window), the bucket a Lua script,
 * and the idempotency cache a `SET key value NX EX 600`. In-memory state is
 * per-process and resets on deploy — fine for a single demo box, not a fleet.
 */
const ipHits = new Map();          // ip -> number[] (timestamps within window)
const idempotencyCache = new Map(); // key -> { status, body, expires }
const bucket = { tokens: CONFIG.globalCapacity, last: Date.now() };

// Periodically sweep expired entries so the Maps don't grow unbounded.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => now - t < CONFIG.ipWindowMs);
    if (fresh.length) ipHits.set(ip, fresh);
    else ipHits.delete(ip);
  }
  for (const [key, entry] of idempotencyCache) {
    if (entry.expires <= now) idempotencyCache.delete(key);
  }
}, CONFIG.sweepEveryMs);
if (sweeper.unref) sweeper.unref(); // don't keep the process alive

/* ───────────────────────── Helpers ───────────────────────── */

function getClientIp(req) {
  // Trust the first hop in X-Forwarded-For (set by Vercel/most proxies).
  // PRODUCTION: pin this to your known proxy count to prevent IP spoofing.
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

/** Global token-bucket. Returns true if a token was available. */
function takeGlobalToken() {
  const now = Date.now();
  const elapsedSec = (now - bucket.last) / 1000;
  bucket.tokens = Math.min(CONFIG.globalCapacity, bucket.tokens + elapsedSec * CONFIG.globalRefillPerSec);
  bucket.last = now;
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

/** Per-IP sliding window. Returns { ok, retryAfter }. */
function checkIpThrottle(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < CONFIG.ipWindowMs);
  if (hits.length >= CONFIG.ipMaxPerWindow) {
    const retryAfter = Math.ceil((CONFIG.ipWindowMs - (now - hits[0])) / 1000);
    ipHits.set(ip, hits);
    return { ok: false, retryAfter };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return { ok: true, retryAfter: 0 };
}

/** Basic server-side validation + light sanitization. */
function validate(body) {
  const errors = [];
  const name = String(body?.name || "").trim().slice(0, 120);
  const phone = String(body?.phone || "").trim().slice(0, 32);
  const appliance = String(body?.appliance || "").trim().slice(0, 60);
  const issue = String(body?.issue || "").trim().slice(0, 1000);

  if (name.length < 2) errors.push("name");
  if (!/[0-9]{7,}/.test(phone.replace(/\D/g, ""))) errors.push("phone");
  if (!appliance) errors.push("appliance");
  if (issue.length < 3) errors.push("issue");

  return { ok: errors.length === 0, errors, clean: { name, phone, appliance, issue } };
}

/** Escape user input before embedding it in the notification email HTML. */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/**
 * Email the lead to the business via the Resend HTTP API (no SDK / dependency).
 * Configure with env vars:
 *   RESEND_API_KEY    — from resend.com (required to actually send)
 *   LEAD_NOTIFY_TO    — where leads are emailed, e.g. "owner@apexappliancesolutions.com"
 *   LEAD_NOTIFY_FROM  — a verified Resend sender, e.g. "Apex Leads <leads@apexappliancesolutions.com>"
 *
 * Returns { ok: true } on success (or when intentionally skipped in local dev),
 * { ok: false } on a real delivery failure so the caller can tell the customer
 * to phone in instead of silently dropping the lead.
 */
async function sendLeadEmail(lead, ip) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM || "Apex Leads <onboarding@resend.dev>";

  // Not configured (e.g. local dev without keys): log it, don't block the form.
  if (!apiKey || !to) {
    console.warn("[lead] Email not configured (RESEND_API_KEY / LEAD_NOTIFY_TO missing) — lead logged only:", lead);
    return { ok: true, skipped: true };
  }

  const received = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const subject = `New repair request: ${lead.appliance} — ${lead.name}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#0f172a;margin:0 0 12px">New appliance repair lead</h2>
      <table cellpadding="8" style="border-collapse:collapse;font-size:14px;width:100%">
        <tr><td style="color:#64748b"><b>Name</b></td><td>${esc(lead.name)}</td></tr>
        <tr><td style="color:#64748b"><b>Phone</b></td><td><a href="tel:${esc(lead.phone)}">${esc(lead.phone)}</a></td></tr>
        <tr><td style="color:#64748b"><b>Appliance</b></td><td>${esc(lead.appliance)}</td></tr>
        <tr><td style="color:#64748b"><b>Issue</b></td><td>${esc(lead.issue)}</td></tr>
        <tr><td style="color:#64748b"><b>Received</b></td><td>${esc(received)} CT</td></tr>
        <tr><td style="color:#64748b"><b>From IP</b></td><td>${esc(ip)}</td></tr>
      </table>
    </div>`;
  const text = `New appliance repair lead
Name: ${lead.name}
Phone: ${lead.phone}
Appliance: ${lead.appliance}
Issue: ${lead.issue}
Received: ${received} CT
From IP: ${ip}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[lead] Resend delivery failed:", res.status, detail);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[lead] Email send threw:", err);
    return { ok: false };
  }
}

/* ───────────────────────── Core handler ─────────────────────────
 * Framework-agnostic: takes a normalized (req, res-like) and a `send()`.
 */
async function handleLead(req, sendJson) {
  if (req.method !== "POST") {
    return sendJson(405, { error: "Method not allowed" }, { Allow: "POST" });
  }

  const ip = getClientIp(req);
  const idempotencyKey = req.headers["idempotency-key"];

  // 1) Idempotency — replay the stored result for a repeated key.
  if (idempotencyKey) {
    const cached = idempotencyCache.get(idempotencyKey);
    if (cached && cached.expires > Date.now()) {
      return sendJson(cached.status, cached.body, { "Idempotent-Replay": "true" });
    }
  }

  // 2) Global rate limit.
  if (!takeGlobalToken()) {
    return sendJson(429, { error: "Service is busy. Please retry shortly." }, { "Retry-After": "5" });
  }

  // 3) Per-IP throttle.
  const ipCheck = checkIpThrottle(ip);
  if (!ipCheck.ok) {
    return sendJson(
      429,
      { error: "Too many requests from your network. Please wait a moment." },
      { "Retry-After": String(ipCheck.retryAfter) }
    );
  }

  // 4) Validate.
  const { ok, errors, clean } = validate(req.body);
  if (!ok) {
    return sendJson(422, { error: "Please check the highlighted fields.", fields: errors });
  }

  // 5) Deliver the lead by email (Resend HTTP API — see sendLeadEmail above).
  //    On a real delivery failure we return an error so the customer is told to
  //    call, rather than silently losing the lead.
  const delivered = await sendLeadEmail(clean, ip);
  if (!delivered.ok) {
    return sendJson(502, {
      error: "We couldn't submit your request just now. Please call us at (267) 367-8852.",
    });
  }

  const result = { ok: true, message: "Lead received. We'll text you a same-day window." };

  // Cache the successful result against the idempotency key.
  if (idempotencyKey) {
    idempotencyCache.set(idempotencyKey, {
      status: 200,
      body: result,
      expires: Date.now() + CONFIG.idempotencyTtlMs,
    });
  }

  return sendJson(200, result);
}

/* ───────────────────────── Adapters ───────────────────────── */

// Vercel / Next.js API route (req.body is pre-parsed JSON).
export default async function handler(req, res) {
  await handleLead(req, (status, body, headers = {}) => {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    res.status(status).json(body);
  });
}

// Express adapter: app.post('/api/lead', express.json(), expressLead)
export async function expressLead(req, res) {
  await handleLead(req, (status, body, headers = {}) => {
    for (const [k, v] of Object.entries(headers)) res.set(k, v);
    res.status(status).json(body);
  });
}
