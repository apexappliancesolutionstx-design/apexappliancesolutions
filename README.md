# Apex Appliance Solutions — Landing Page

Premium single-page site for an appliance repair business in **Leander, TX** (Williamson County).
React + Tailwind CSS, fully responsive, with native fluid animations, local-SEO copy, and a
secured lead-capture API.

## Files

| File | Purpose |
| --- | --- |
| `src/ApexApplianceSolutions.jsx` | The entire single-file React component (UI, animations, JSON-LD schema). |
| `api/lead.js` | Secured form endpoint: idempotency key + rate limiting + per-IP throttling. |

## Quick start (Vite)

```bash
npm create vite@latest apex -- --template react
cd apex
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

1. In `tailwind.config.js`, set `content: ["./index.html", "./src/**/*.{js,jsx}"]`.
2. Add Tailwind directives to `src/index.css`:
   ```css
   @tailwind base; @tailwind components; @tailwind utilities;
   ```
3. Load the **Inter** font in `index.html` `<head>` and map it to `font-sans`
   (`fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }` in the Tailwind theme).
4. Drop in `src/ApexApplianceSolutions.jsx` and render it from `App.jsx`.
5. Wire `api/lead.js` into Vercel (`/api/lead`) or an Express server.

## Design system

- **Navy** `#0f172a` (`slate-900`) · **White** · **Electric-blue accent** `#2563eb` (the `--accent` CSS var, matched to the company logo) · **Light blue** `#60a5fa` (`--accent-light`, for icons/text on the dark navy chips). All CTAs use white text on the blue for contrast. Change `--accent` in `BrandStyles` to re-theme the whole site.
- Typography: **Inter** (clean modern sans-serif).

## Animations (no physics libs — pure Tailwind + CSS)

- **Smooth scroll** via `html { scroll-behavior: smooth }` + anchor nav.
- **Hero entrance** — staggered `fade-in-up` (`riseIn` keyframe, `cubic-bezier(.16,1,.3,1)`).
- **Card hover FX** — lift, border shift, soft glow shadow (`transition-all duration-300 ease-out`).
- **Button pulse** — gentle continuous glow on primary CTAs, pauses on hover (magnetic feel).
- **Form focus** — fluid border-color transition, focus ring, and floating labels.
- **Interactive reveal** — service cards expand/collapse details via `grid-rows-[0fr→1fr]` transition.
- Respects `prefers-reduced-motion`.

## Local SEO

- Semantic `h1`/`h2`/`h3` hierarchy and a real `<footer>`.
- Keywords woven naturally: *"appliance repair in Leander, TX"*, *"Leander refrigerator repair"*,
  *"Williamson County appliance technicians"*, plus Cedar Park / Liberty Hill / Georgetown.
- **JSON-LD `LocalBusiness` schema** included as a commented block at the top of the component —
  uncomment and paste into your hosting `<head>` (fill in real phone, URL, geo, image).

## Security (api/lead.js)

- **Idempotency-Key** header (the form generates a stable `crypto.randomUUID()` per session) →
  duplicate clicks/retries return the same cached result, never a duplicate lead.
- **Global rate limit** — token bucket (~60 req/min) protects the endpoint and downstream CRM.
- **Per-IP throttle** — sliding window (5 req/min/IP) returns `429` + `Retry-After`.
- Server-side validation + field-length sanitization.

> The store is **in-memory** for demo simplicity. For production/multi-instance, swap the
> `Map`s for Redis/Upstash (notes inline in `api/lead.js`) so limits hold across processes,
> and pin `X-Forwarded-For` parsing to your known proxy hop count to prevent IP spoofing.

## Lead delivery (email)

Submitted leads are emailed to the business via the **Resend** HTTP API (no SDK/dependency).
Configure three env vars (see `.env.example`):

| Var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `LEAD_NOTIFY_TO` | Inbox that receives leads |
| `LEAD_NOTIFY_FROM` | A verified Resend sender address |

Setup:

1. `cp .env.example .env` and fill in the values (local dev reads `.env`; on Vercel/your host,
   set them in the project's environment-variables settings instead).
2. In Resend, verify your sending domain so `LEAD_NOTIFY_FROM` can use it (until then, the
   sandbox sender `onboarding@resend.dev` works for testing).

Behavior: on a real delivery failure the API returns `502` and the form tells the customer to
call, so a lead is **never silently lost**. If the keys are absent (local dev), the email is
skipped and the lead is logged to the server console instead. Idempotent replays do **not**
re-send email. To use a different provider (SendGrid, Postmark, SMTP…), swap the `fetch` call
inside `sendLeadEmail()` in `api/lead.js`.
