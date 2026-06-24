import React, { useEffect, useState } from "react";
import logoUrl from "../logo.png";

/**
 * Apex Appliance Solutions — premium single-page site.
 * Premium appliance repair in Leander, TX (Williamson County).
 *
 * Single-file React component. Requires Tailwind CSS in the host app.
 * All custom keyframe animations are injected once via <BrandStyles/> so the
 * component stays drop-in with the default Tailwind build (no config edits).
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  LOCAL BUSINESS SCHEMA (JSON-LD)  —  drop into your hosting <head>
 *  Uncomment and paste into the page head, or render via next/script.
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  <script type="application/ld+json">
 *  {
 *    "@context": "https://schema.org",
 *    "@type": "LocalBusiness",
 *    "@id": "https://apexappliancesolutions.com/#business",
 *    "name": "Apex Appliance Solutions",
 *    "description": "Fast, licensed appliance repair in Leander, TX. Same-day refrigerator, washer, dryer, oven, range and dishwasher repair across Williamson County.",
 *    "url": "https://apexappliancesolutions.com",
 *    "telephone": "+1-267-367-8852",
 *    "image": "https://apexappliancesolutions.com/og-image.jpg",
 *    "priceRange": "$$",
 *    "areaServed": [
 *      { "@type": "City", "name": "Leander", "address": { "@type": "PostalAddress", "addressRegion": "TX" } },
 *      { "@type": "City", "name": "Cedar Park", "address": { "@type": "PostalAddress", "addressRegion": "TX" } },
 *      { "@type": "City", "name": "Liberty Hill", "address": { "@type": "PostalAddress", "addressRegion": "TX" } },
 *      { "@type": "City", "name": "Georgetown", "address": { "@type": "PostalAddress", "addressRegion": "TX" } },
 *      { "@type": "City", "name": "Austin", "address": { "@type": "PostalAddress", "addressRegion": "TX" } }
 *    ],
 *    "address": {
 *      "@type": "PostalAddress",
 *      "addressLocality": "Leander",
 *      "addressRegion": "TX",
 *      "postalCode": "78641",
 *      "addressCountry": "US"
 *    },
 *    "geo": { "@type": "GeoCoordinates", "latitude": 30.5788, "longitude": -97.8531 },
 *    "openingHoursSpecification": [
 *      { "@type": "OpeningHoursSpecification",
 *        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
 *        "opens": "07:00", "closes": "20:00" }
 *    ],
 *    "makesOffer": [
 *      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Leander refrigerator repair" } },
 *      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Washer and dryer repair" } },
 *      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Oven and range repair" } },
 *      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Dishwasher repair" } }
 *    ]
 *  }
 *  </script>
 * ──────────────────────────────────────────────────────────────────────────
 */

const PHONE_DISPLAY = "(267) 367-8852";
const PHONE_HREF = "tel:+12673678852";
// Web3Forms public access key (safe to expose in client code — designed for
// static sites; it only allows sending mail to the registered inbox).
const WEB3FORMS_ACCESS_KEY = "421e1251-78ae-4913-8866-bd63c87beec4";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Service Area", href: "#service-area" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    id: "refrigerator",
    title: "Refrigerator Repair",
    blurb: "Leander refrigerator repair for cooling loss, leaks, ice makers, and noisy compressors.",
    icon: FridgeIcon,
    details: [
      "Not cooling / over-freezing diagnostics",
      "Ice maker & water line repair",
      "Compressor, fan & thermostat service",
      "Side-by-side, French door & built-in units",
    ],
  },
  {
    id: "washer-dryer",
    title: "Washer & Dryer Repair",
    blurb: "Front-load and top-load laundry repair — drainage, spin, heat, and error codes.",
    icon: WasherIcon,
    details: [
      "Won't drain, spin, or agitate",
      "No-heat & long dry-time fixes",
      "Bearing, belt & pump replacement",
      "Stacked and combo unit service",
    ],
  },
  {
    id: "oven-range",
    title: "Oven & Range Repair",
    blurb: "Gas and electric oven, range, and cooktop repair done safely and to code.",
    icon: OvenIcon,
    details: [
      "Uneven heat & temperature calibration",
      "Igniter, burner & element replacement",
      "Control board & sensor repair",
      "Gas line safety inspection",
    ],
  },
  {
    id: "dishwasher",
    title: "Dishwasher Repair",
    blurb: "Stop the leaks and poor cleaning — fast dishwasher repair across Williamson County.",
    icon: DishwasherIcon,
    details: [
      "Leaks, draining & standing water",
      "Poor cleaning & spray arm issues",
      "Pump, valve & gasket replacement",
      "Built-in & panel-ready models",
    ],
  },
];

const SERVICE_AREAS = [
  { name: "Leander", note: "Our home base — fastest response times in town." },
  { name: "Cedar Park", note: "Same-day slots for cooling and laundry emergencies." },
  { name: "Liberty Hill", note: "Trusted local technicians for growing neighborhoods." },
  { name: "Georgetown", note: "Full-service repair across the Williamson County seat." },
  { name: "Austin", note: "Extending our trusted local service into the greater Austin area." },
];

const BRANDS = ["Whirlpool", "Samsung", "Bosch", "LG", "GE", "Maytag", "KitchenAid", "Frigidaire"];

export default function ApexApplianceSolutions() {
  return (
    <div className="min-h-screen scroll-smooth bg-white font-sans text-slate-900 antialiased">
      <BrandStyles />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <Pricing />
        <ServiceArea />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
}

/* ───────────────────────────── Header ───────────────────────────── */

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ease-out ${
        scrolled
          ? "border-slate-200 bg-white/90 backdrop-blur shadow-sm"
          : "border-transparent bg-white/70 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center">
          <img
            src={logoUrl}
            alt="Apex Appliance Solutions — appliance repair in Leander, TX"
            className="h-14 w-auto transition-transform duration-300 ease-out group-hover:-translate-y-0.5 sm:h-16"
          />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-300 ease-out hover:text-slate-900 after:absolute after:bottom-1 after:left-3 after:h-0.5 after:w-0 after:rounded-full after:bg-[--accent] after:transition-all after:duration-300 after:ease-out hover:after:w-[calc(100%-1.5rem)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={PHONE_HREF}
            className="text-sm font-bold text-slate-700 transition-colors duration-300 hover:text-slate-900"
          >
            {PHONE_DISPLAY}
          </a>
          <a href="#contact" className="btn-pulse rounded-xl bg-[--accent] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
            Book Now
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 ease-out md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-xl bg-[--accent] px-5 py-3 text-center text-sm font-bold text-white"
          >
            Book Now
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-slate-900 text-white">
      {/* layered background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-16 top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        {/* Soft vertical fade for depth (replaces the old grid pattern) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-slate-950/50" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        <div>
          <span className="anim-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 [animation-delay:0ms]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[--accent]" />
            Trusted Williamson County appliance technicians
          </span>

          <h1 className="anim-rise mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl [animation-delay:80ms]">
            Fast, local appliance repair in{" "}
            <span className="relative whitespace-nowrap text-[--accent-light]">Leander, TX</span>
          </h1>

          <p className="anim-rise mt-6 max-w-xl text-lg leading-relaxed text-slate-300 [animation-delay:160ms]">
            Same-day service for the brands you own —{" "}
            <span className="font-semibold text-white">Whirlpool, Samsung, Bosch, LG, GE</span>, Maytag and more.
            Licensed, insured local techs who fix it right the first time.
          </p>

          <div className="anim-rise mt-8 flex flex-col gap-3 sm:flex-row [animation-delay:240ms]">
            <a
              href="#contact"
              className="btn-pulse inline-flex items-center justify-center gap-2 rounded-xl bg-[--accent] px-7 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/40"
            >
              Schedule Repair
              <ArrowIcon className="h-5 w-5" />
            </a>
            <a
              href={PHONE_HREF}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-base font-bold text-white backdrop-blur transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              <PhoneIcon className="h-5 w-5" />
              Call Now
            </a>
          </div>

          <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400 [animation-delay:320ms]">
            <span className="inline-flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[--accent-light]" /> Licensed &amp; insured
            </span>
            <span className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="inline-flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-[--accent-light]" /> Same-day availability
            </span>
          </div>
        </div>

        {/* Hero card */}
        <div className="anim-rise relative [animation-delay:200ms]">
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">Today's Availability</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Open Now
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { time: "9:00 AM", label: "Morning" },
                { time: "1:00 PM", label: "Afternoon" },
                { time: "5:00 PM", label: "Evening" },
              ].map((slot) => (
                <div
                  key={slot.time}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-all duration-300 ease-out hover:border-[--accent]/50 hover:bg-white/[0.06]"
                >
                  <div>
                    <div className="text-lg font-bold text-white">{slot.time}</div>
                    <div className="text-xs text-slate-400">{slot.label} window</div>
                  </div>
                  <span className="rounded-full bg-[--accent]/15 px-3 py-1 text-xs font-bold text-[--accent-light]">Available</span>
                </div>
              ))}
            </div>
            <a
              href="#contact"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-900 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Reserve My Time <ArrowIcon className="h-4 w-4" />
            </a>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-[--accent]/20 blur-2xl" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Trust Bar ───────────────────────────── */

function TrustBar() {
  const items = [
    { icon: ShieldIcon, title: "Licensed & Insured", sub: "Background-checked local pros" },
    { icon: ClockIcon, title: "Same-Day Availability", sub: "Often within 2 hours in Leander" },
    { icon: BadgeIcon, title: "90-Day Warranty", sub: "Parts & labor, fully guaranteed" },
  ];
  return (
    <section aria-label="Why homeowners trust Apex" className="border-b border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        {items.map((it) => (
          <div
            key={it.title}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[--accent-light] transition-transform duration-300 ease-out group-hover:scale-105">
              <it.icon className="h-6 w-6" />
            </span>
            <div>
              <div className="text-base font-bold text-slate-900">{it.title}</div>
              <div className="text-sm text-slate-500">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Services ───────────────────────────── */

function Services() {
  const [openId, setOpenId] = useState(null);

  return (
    <section id="services" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="Expert appliance repair in Leander, TX"
          subtitle="From a warm fridge to a silent dryer, our Williamson County technicians diagnose fast and fix it right. Tap any service to see what we handle."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((svc) => {
            const isOpen = openId === svc.id;
            return (
              <article
                key={svc.id}
                className={`group relative flex flex-col rounded-3xl border bg-white p-6 transition-all duration-300 ease-out hover:-translate-y-2 ${
                  isOpen
                    ? "border-[--accent] shadow-2xl shadow-blue-500/10"
                    : "border-slate-200 hover:border-[--accent]/60 hover:shadow-2xl hover:shadow-blue-500/10"
                }`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-[--accent-light] transition-all duration-300 ease-out group-hover:scale-105 group-hover:rotate-3">
                  <svc.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{svc.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{svc.blurb}</p>

                {/* Interactive reveal */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <ul className="overflow-hidden space-y-2 text-sm text-slate-600">
                    {svc.details.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[--accent]" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setOpenId(isOpen ? null : svc.id)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 transition-colors duration-300 hover:text-[--accent]"
                  aria-expanded={isOpen}
                >
                  {isOpen ? "Show less" : "What we fix"}
                  <ChevronIcon className={`h-4 w-4 transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Pricing ───────────────────────────── */

function Pricing() {
  const promises = [
    { icon: CheckIcon, t: "Upfront written quote", s: "You see and approve the price before any work begins." },
    { icon: ShieldIcon, t: "Diagnostic fee waived", s: "The $79 is applied to your bill when you book the repair." },
    { icon: BadgeIcon, t: "No hidden fees", s: "Flat-rate pricing — the quote you approve is the price you pay." },
  ];
  return (
    <section id="pricing" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Honest, upfront pricing — no surprises"
          subtitle="Every appliance issue is different, so we never guess at a price over the phone. A technician diagnoses the problem on-site, then gives you a clear, written quote before any work begins."
        />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
          {/* Diagnostic offer */}
          <div className="relative flex flex-col rounded-3xl border border-[--accent] bg-slate-900 p-8 text-white shadow-2xl shadow-blue-500/20">
            <span className="absolute -top-3 left-8 rounded-full bg-[--accent] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Where every repair starts
            </span>
            <h3 className="text-lg font-bold text-white">Diagnostic Visit</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold tracking-tight">$79</span>
              <span className="text-sm text-slate-300">waived with repair</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {[
                "Full on-site appliance inspection",
                "Accurate, written repair quote",
                "Fee applied to your repair cost",
                "All major brands serviced",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[--accent-light]" />
                  <span className="text-slate-200">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[--accent] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Book a Diagnostic <ArrowIcon className="h-4 w-4" />
            </a>
          </div>

          {/* Why no fixed prices */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-900">Why we don't post fixed repair prices</h3>
            <p className="leading-relaxed text-slate-600">
              The same symptom can have very different causes — and very different parts costs. Quoting
              blind would just mean guessing, and surprises on your final bill. Instead, we diagnose
              first, then give you a fair flat rate to approve before we lift a wrench.
            </p>
            <ul className="space-y-4">
              {promises.map((p) => (
                <li key={p.t} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[--accent-light]">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{p.t}</div>
                    <div className="text-sm text-slate-500">{p.s}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Service Area ───────────────────────────── */

function ServiceArea() {
  return (
    <section id="service-area" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Service Area"
            title="Proudly serving Leander & Williamson County"
            subtitle="As local appliance technicians based right here in Leander, we keep drive times short and response times fast. We cover Leander, Cedar Park, Liberty Hill, Georgetown, and the greater Austin area."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {SERVICE_AREAS.map((a) => (
              <span
                key={a.name}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[--accent] hover:text-slate-900 hover:shadow-md"
              >
                <PinIcon className="h-4 w-4 text-[--accent]" />
                {a.name}, TX
              </span>
            ))}
          </div>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Check My Address <ArrowIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICE_AREAS.map((a) => (
            <div
              key={a.name}
              className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[--accent]/60 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-[--accent-light] transition-transform duration-300 group-hover:scale-110">
                  <PinIcon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">{a.name}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{a.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Lead Form ───────────────────────────── */

function LeadForm() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New repair request: ${form.appliance.value} — ${form.name.value.trim()}`,
      from_name: "Apex Appliance Solutions Website",
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      appliance: form.appliance.value,
      issue: form.issue.value.trim(),
      botcheck: form.botcheck?.checked || false,
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error("Something went wrong. Please call us at " + PHONE_DISPLAY);
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err.message || "Submission failed. Please try again.");
    }
  }

  return (
    <section id="contact" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        {/* Left copy */}
        <div className="lg:col-span-2">
          <SectionHeading
            align="left"
            eyebrow="Book Your Repair"
            title="Schedule appliance repair in Leander, TX"
            subtitle="Tell us what's wrong and we'll text you a same-day window. No obligation — just fast, friendly help from your local technicians."
          />
          <ul className="mt-8 space-y-4">
            {[
              { icon: ClockIcon, t: "Same-day & next-day slots", s: "Often at your door within 2 hours" },
              { icon: ShieldIcon, t: "Licensed & insured techs", s: "Every repair backed by a 90-day warranty" },
              { icon: PhoneIcon, t: "Prefer to talk?", s: PHONE_DISPLAY },
            ].map((row) => (
              <li key={row.t} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[--accent-light]">
                  <row.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold text-slate-900">{row.t}</div>
                  <div className="text-sm text-slate-500">{row.s}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Form card */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="h-8 w-8" />
                </span>
                <h3 className="mt-5 text-2xl font-bold text-slate-900">Request received!</h3>
                <p className="mt-2 max-w-sm text-slate-500">
                  Thanks — a Leander technician will text you a same-day window shortly. Need us now? Call{" "}
                  <a href={PHONE_HREF} className="font-bold text-slate-900 underline">{PHONE_DISPLAY}</a>.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  Book another repair
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot for spam bots (Web3Forms) — hidden from real users */}
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <FloatingField id="name" label="Full name" type="text" autoComplete="name" required />
                  <FloatingField id="phone" label="Phone number" type="tel" autoComplete="tel" required />
                </div>

                <FloatingSelect
                  id="appliance"
                  label="Appliance type"
                  options={["Refrigerator", "Washer", "Dryer", "Oven / Range", "Dishwasher", "Other"]}
                />

                <FloatingField id="issue" label="Briefly describe the issue" textarea required />

                {status === "error" && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="btn-pulse flex w-full items-center justify-center gap-2 rounded-xl bg-[--accent] px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "submitting" ? "Sending…" : "Book My Repair"}
                  {status !== "submitting" && <ArrowIcon className="h-5 w-5" />}
                </button>
                <p className="text-center text-xs text-slate-400">
                  By submitting, you agree to be contacted about your repair. We never share your info.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Floating-label text / textarea field */
function FloatingField({ id, label, type = "text", textarea = false, required, autoComplete }) {
  const base =
    "peer w-full rounded-xl border border-slate-200 bg-white px-4 pt-6 pb-2 text-slate-900 placeholder-transparent outline-none transition-all duration-300 ease-out focus:border-[--accent] focus:ring-4 focus:ring-blue-500/10";
  return (
    <div className="relative">
      {textarea ? (
        <textarea id={id} name={id} rows={4} placeholder={label} required={required} className={`${base} resize-none`} />
      ) : (
        <input id={id} name={id} type={type} placeholder={label} required={required} autoComplete={autoComplete} className={base} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 text-slate-400 transition-all duration-300 ease-out peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[--accent] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}

/* Floating-label select */
function FloatingSelect({ id, label, options }) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        defaultValue=""
        required
        className="peer w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pt-6 pb-2 text-slate-900 outline-none transition-all duration-300 ease-out focus:border-[--accent] focus:ring-4 focus:ring-blue-500/10"
      >
        <option value="" disabled hidden />
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-xs font-semibold text-slate-400 transition-all duration-300 ease-out peer-focus:text-[--accent]"
      >
        {label}
      </label>
      <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* ───────────────────────────── Footer ───────────────────────────── */

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <a href="#top" className="inline-flex transition-transform duration-300 ease-out hover:-translate-y-0.5">
            <img
              src={logoUrl}
              alt="Apex Appliance Solutions"
              className="h-20 w-auto rounded-2xl bg-white p-3 shadow-lg"
            />
          </a>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Premium, same-day appliance repair in Leander, TX and across Williamson County. Licensed,
            insured local technicians servicing all major brands with a 90-day warranty.
          </p>
          <a
            href={PHONE_HREF}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[--accent] px-5 py-3 text-sm font-bold text-white transition-all duration-300 ease-out hover:-translate-y-0.5"
          >
            <PhoneIcon className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {["Leander refrigerator repair", "Washer & dryer repair", "Oven & range repair", "Dishwasher repair"].map((s) => (
              <li key={s}>
                <a href="#services" className="transition-colors duration-300 hover:text-[--accent-light]">{s}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Service Area</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICE_AREAS.map((a) => (
              <li key={a.name}>
                <a href="#service-area" className="transition-colors duration-300 hover:text-[--accent-light]">{a.name}, TX</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Apex Appliance Solutions · Appliance repair in Leander, TX · Williamson County appliance technicians.</p>
          <p>Licensed &amp; Insured · Same-Day Service · 90-Day Warranty</p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────────── Shared bits ───────────────────────────── */

function SectionHeading({ eyebrow, title, subtitle, align = "center", dark = false }) {
  const isLeft = align === "left";
  return (
    <div className={isLeft ? "max-w-2xl" : "mx-auto max-w-2xl text-center"}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[--accent]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[--accent]">
        {eyebrow}
      </span>
      <h2 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-slate-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? "text-slate-300" : "text-slate-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StarRow({ count = 5, className = "text-[--accent-light]" }) {
  return (
    <span className={`inline-flex ${className}`} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} className="h-4 w-4" />
      ))}
    </span>
  );
}

/* Inject brand tokens + premium keyframes once. */
function BrandStyles() {
  return (
    <style>{`
      :root {
        --accent: #2563eb;                    /* brand electric-blue CTA accent (from logo) */
        --accent-light: #60a5fa;              /* lighter blue for icons on navy chips */
        /* Themed wrench cursor (brand blue, navy outline). Hotspot top-left. */
        --cursor-wrench: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%232563eb' stroke='%230f172a' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><g transform='translate(24 0) scale(-1 1)'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/></g></svg>") 4 4, auto;
      }
      /* Wrench cursor everywhere, but keep a text caret inside form fields. */
      * { cursor: var(--cursor-wrench); }
      input, textarea { cursor: text; }
      html { scroll-behavior: smooth; }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .anim-rise, .btn-pulse { animation: none !important; }
      }

      /* Hero fade-in-up */
      @keyframes riseIn {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .anim-rise {
        opacity: 0;
        animation: riseIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* Gentle CTA pulse to draw the eye */
      @keyframes softPulse {
        0%, 100% { box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.35); }
        50%      { box-shadow: 0 10px 40px -2px rgba(37, 99, 235, 0.6); }
      }
      .btn-pulse { animation: softPulse 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      .btn-pulse:hover { animation-play-state: paused; }
    `}</style>
  );
}

/* ───────────────────────────── Icons (inline SVG) ───────────────────────────── */

function BoltIcon(p) { return (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" /></svg>); }
function ArrowIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>); }
function PhoneIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>); }
function CheckIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5" /></svg>); }
function ChevronIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6" /></svg>); }
function StarIcon(p) { return (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z" /></svg>); }
function PinIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>); }
function ShieldIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>); }
function ClockIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>); }
function BadgeIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="6" /><path d="m9 14-1.5 7L12 18l4.5 3L15 14" /></svg>); }

function FridgeIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M6 10h12M10 5v2M10 13v3" /></svg>); }
function WasherIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="14" r="4" /><path d="M8 6h.01M11 6h.01" /></svg>); }
function OvenIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M8 6h.01M12 6h.01" /><rect x="8" y="12" width="8" height="6" rx="1" /></svg>); }
function DishwasherIcon(p) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M4 7h16M8 11c1.5 1 2.5 1 4 0s2.5-1 4 0M8 15c1.5 1 2.5 1 4 0s2.5-1 4 0" /></svg>); }
