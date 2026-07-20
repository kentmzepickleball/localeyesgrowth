"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Noise } from "@/components/effects/Noise";

/* ----------------------------------------------------------------------
   Coffee Catering Price Calculator — flagship linkable asset
   Audience: COFFEE CART OPERATORS. "What should I charge for this event?"

   Art direction: "the operator's worksheet" — a typeset rate card, not
   a web widget. Cream paper, ink type, tabular numerals; brand gold
   reserved for the live total, selected (stamped) states, and the CTA.

   Structure:
   1. Opener — H1 + eyebrow + intro + trust line (site voice, asymmetric).
   2. The worksheet — typeset controls left (ticket radios with a ✦
      stamp, an ink-stamped positioning strip, underlined tap-to-type
      numerals over thin-rule sliders, an order-form add-on checklist);
      a sticky "ledger" right under a double masthead rule — the EST.
      RATE stamp, a huge gold total, dotted-leader breakdown, and a
      perforated ticket CTA. Mobile pins a cream ledger strip bottom.
   3. Quote modal — a paper order form (underlined fields, an unfolding
      printed calendar for the event date — no free text, past dates
      disabled — and a stamped success state), prefilled with the exact
      configuration. Deep-linked at ?modal=quote via the History API —
      the URL is shareable, a direct visit opens the modal on load, and
      Back/Forward open/close it. Masthead and heading stay put; only
      the body scrolls, behind a thin rounded brand-gold scrollbar
      (WebKit + Firefox).
   4. Embed affordance — copy-paste iframe snippet + backlink.
   5. Editorial: what drives pricing / how carts underprice / FAQ.
   6. FAQPage JSON-LD generated from the same CONFIG copy.

   ?embed=1 hides header, footer, intro and editorial — renders only the
   calculator card plus a "Powered by LocalEyes" backlink.

   EVERY constant and every line of copy lives in CONFIG below.
   NO italics anywhere. No default browser controls. GPU-friendly motion
   only (transform/opacity + rAF number rolls), disabled under
   prefers-reduced-motion.

   CALIBRATION (must hold): Espresso · Standard · 100 guests · 3 hrs ·
   15 mi · no add-ons → $1,105 recommended · range $881–$1,479 ·
   $11/guest · $7.37/drink · 150 drinks · 1 barista · 1 cart · ~50/hr.
   Only change vs the spec sheet: POSITIONING premium 1.338 → 1.3385
   (1.338 rounds to $1,478, not the required $1,479).
   ---------------------------------------------------------------------- */

/* ============================ CONFIG ================================== */
const CONFIG = {
  model: {
    /* ---- drinks & staffing ---- */
    DRINKS_PER_GUEST: 1.5 /* derived from the live tool (100 → 150) */,
    THROUGHPUT_PER_BARISTA_HOUR: 50 /* comfortable pace 45–60/hr */,
    MAX_DRINKS_PER_BARISTA_HOUR: 60 /* add a barista past this */,
    CARTS_PER_BARISTA_GROUP: 2 /* VERIFY: baristas sharing one cart */,

    /* ---- base price — tiered base package covering the first 2 hours,
       plus an hourly rate for each additional hour. 2 hrs is the
       billing minimum (noted in the UI). VERIFY all numbers. ---- */
    MIN_BILLABLE_HOURS: 2,
    TIERS: [
      { maxGuests: 50, base2hr: 640, extraHour: 185 },
      { maxGuests: 100, base2hr: 880, extraHour: 225 },
      { maxGuests: 150, base2hr: 1080, extraHour: 255 },
      { maxGuests: 200, base2hr: 1280, extraHour: 285 },
      { maxGuests: 300, base2hr: 1760, extraHour: 380 },
      { maxGuests: Infinity, base2hr: 2400, extraHour: 515 },
    ],

    /* ---- cart type ---- */
    CART_TYPES: {
      espresso: {
        title: "Espresso Cart",
        sub: "Espresso machine on board — lattes, cappuccinos, hot & iced espresso drinks",
        multiplier: 1.0,
      },
      nonEspresso: {
        title: "Non-Espresso Cart",
        sub: "No espresso machine — drip, cold brew, matcha & iced lattes",
        multiplier: 0.75 /* VERIFY */,
      },
    },

    /* ---- positioning (derived from the live tool: 881/1105, 1479/1105).
       premium is 1.3385, NOT the spec's 1.338 — 1.338 rounds the
       calibration event to $1,478 instead of the required $1,479. ---- */
    POSITIONING: {
      value: {
        title: "Value",
        sub: "Win on price & volume. Bottom ~25% of the market.",
        multiplier: 0.797,
      },
      standard: {
        title: "Standard",
        sub: "Priced at the market median. Where most operators land.",
        multiplier: 1.0,
        badge: "Recommended",
      },
      premium: {
        title: "Premium",
        sub: "High-touch, top ~25%. Charge for quality & experience.",
        multiplier: 1.3385,
      },
    },

    /* ---- travel ---- */
    TRAVEL_FREE_RADIUS_MI: 30 /* VERIFY */,
    TRAVEL_PER_MILE: 2.5 /* VERIFY — beyond the free radius */,

    /* ---- add-ons — ALL VERIFY. flat or per-guest. ---- */
    ADDONS: {
      customBrandedCart: {
        label: "Custom Branded Cart",
        sub: "Your logo & branding on the cart",
        type: "flat",
        amount: 350,
      },
      customBrandedCups: {
        label: "Custom Branded Cups",
        sub: "Printed / stickered cups, per guest",
        type: "perGuest",
        amount: 2.5,
      },
      latteArtPrinter: {
        label: "Latte Art Logo Printer",
        sub: "Your logo printed on every drink",
        type: "flat",
        amount: 400,
      },
      coldBrewService: {
        label: "Cold Brew Service",
        sub: "Add cold brew to your menu",
        type: "flat",
        amount: 250,
      },
      dripCoffeeStation: {
        label: "Drip Coffee Station",
        sub: "3 gallons, self-serve",
        type: "flat",
        amount: 150,
      },
      matchaSpecialtyTea: {
        label: "Matcha / Specialty Tea",
        sub: "Non-coffee option, per guest",
        type: "perGuest",
        amount: 1.5,
      },
      affogatoService: {
        label: "Affogato Service",
        sub: "Espresso over ice cream, per guest",
        type: "perGuest",
        amount: 3.0,
      },
      generatorNoPower: {
        label: "Generator / No Power",
        sub: "Portable power when the venue has no outlets",
        type: "flat",
        amount: 200,
      },
      signatureDrink: {
        label: "Signature Drink",
        sub: "Custom drink built for the event",
        type: "flat",
        amount: 150,
      },
      customSyrupFlavor: {
        label: "Custom Syrup Flavor",
        sub: "Branded / specialty syrup",
        type: "flat",
        amount: 75,
      },
      customPrintedMenu: {
        label: "Custom Printed Menu",
        sub: "Branded menu board / cards",
        type: "flat",
        amount: 100,
      },
      earlySetupArrival: {
        label: "Early Setup / Arrival",
        sub: "Extra-early load-in",
        type: "flat",
        amount: 150,
      },
    },
  },

  input: {
    GUESTS_MIN: 10,
    GUESTS_MAX: 450 /* displayed as "450+" at the top of the range */,
    GUESTS_STEP: 5,
    GUESTS_DEFAULT: 100,
    HOURS_MIN: 1,
    HOURS_MAX: 8,
    HOURS_DEFAULT: 3,
    MILES_MIN: 0,
    MILES_MAX: 120,
    MILES_STEP: 5,
    MILES_DEFAULT: 15,
  },

  links: {
    /* VERIFY the canonical URL before launch — used by the embed snippet */
    CANONICAL_URL: "https://www.localeyesgrowth.com/coffee-cart-pricing-calculator",
    HOME: "/",
  },

  copy: {
    eyebrow:
      "Know exactly what to charge for any coffee cart or mobile espresso event — in seconds.",
    h1: "Coffee Catering Price Calculator",
    intro:
      "Pricing a coffee cart event by gut feel leaves money on the table — or scares clients away. Tune the event below and get value, standard, and premium pricing instantly, plus a client-ready quote you can send on the spot.",
    trustLine:
      "Built from years consulting with 60+ coffee caterers · 12+ years in the specialty coffee industry.",

    calcHeading: "What should you charge for this event?",
    calcSub:
      "It starts with a typical event — espresso cart, standard positioning, 100 guests, 3 hours, 15 miles. Adjust anything; your price updates live.",

    steps: {
      cart: { title: "Choose your cart" },
      positioning: { title: "Pick your positioning" },
      event: { title: "Tell us about the event" },
      addons: { title: "Add-ons & upgrades", optional: "optional" },
    },

    sliders: {
      guests: { label: "Guests" },
      hours: {
        label: "Service hours",
        minimumNote:
          "2-hour minimum — shorter events are billed at the 2-hour base.",
      },
      miles: { label: "Travel distance" },
    },

    results: {
      recommendedLabel: "Recommended price",
      rangePrefix: "market range",
      chips: {
        perGuest: "Per guest",
        perDrink: "Per drink",
        drinks: "Drinks served",
      },
      compareLabel: "Compare positioning",
      breakdownLabel: "Price breakdown",
      baseLine: "Base service price",
      travelLine: "Travel fee",
      totalLine: "Recommended total",
      setupPace: "a comfortable pace is 45–60/hr per barista",
    },

    lead: {
      heading: "Lock in this quote",
      body: "Enter your details and we'll generate a polished, client-ready quote you can send today — and email a copy to you.",
      fields: {
        name: "Your name",
        email: "Your email",
        business: "Your business name",
        phone: "Your phone (optional)",
        client: "Client / event name (optional)",
        date: "Event date",
      },
      datePlaceholder: "Select a date",
      dateNote: "Past dates are unavailable — events start today or later.",
      submit: "Generate my client-ready quote",
      ctaShort: "Lock in",
      copySummary: "Copy summary",
      copied: "Copied",
      startOver: "Start over",
      successTitle: "Quote request received.",
      successBody:
        "We're generating your client-ready quote now — a copy is on its way to",
      errorRequired: "Required",
      errorEmail: "Enter a valid email",
      errorSubmit: "Something went wrong — please try again.",
    },

    embed: {
      affordance: "Get this calculator for your site",
      title: "Embed this calculator",
      body: "Paste this snippet anywhere on your site. It's free — just keep the link back to LocalEyes.",
      copyButton: "Copy snippet",
      copied: "Copied",
      poweredBy: "Calculator by LocalEyes",
    },

    drivers: {
      eyebrow: "The model, explained",
      title: "What actually drives coffee cart pricing",
      items: [
        {
          title: "Guest count",
          body: "The single biggest lever. More guests means more drinks, more baristas, and eventually a second cart — each one a step change in price, not a smooth curve.",
        },
        {
          title: "Service hours",
          body: "Industry pricing is a base package covering the first two hours, plus an hourly rate for each additional hour. Setup and teardown cost the same whether you pour for one hour or five.",
        },
        {
          title: "Staffing ratios",
          body: "A barista comfortably sustains 45–60 drinks an hour. Past that, the line backs up and the experience dies. Staff to throughput, then price the staff.",
        },
        {
          title: "Travel",
          body: "Distance is a real cost — fuel, drive time, load-in. Most carts fold a local radius into the base, then bill per mile beyond it. Absorb it and you're quietly discounting every far-away event.",
        },
        {
          title: "Add-ons",
          body: "Branded cups, cold brew, latte art printing — anything bespoke carries product and setup cost and should carry a line item. Custom work priced at zero reads as worthless.",
        },
        {
          title: "Minimums",
          body: "The 2-hour minimum protects your floor. Every event carries fixed costs — prep, load-in, teardown — whether it's 20 guests or 200.",
        },
      ],
    },

    underprice: {
      eyebrow: "The pattern",
      title: "How most carts underprice",
      body: [
        "Most operators price their time instead of their throughput. They quote an hourly rate that feels fair for a person, when the client is actually buying a system — cart, equipment, staffing, and a line that keeps moving for three hundred people.",
        "The second mistake is absorbing the edges: travel gets folded in, the extra half-hour gets waved off, the branded cups get thrown in to close the deal. Each one feels small. Together they routinely erase 15–20% of an event's margin.",
        "And almost nobody re-prices. The rate that made sense at ten events a year quietly becomes a discount at forty. If your calendar is full and nobody has pushed back on price in six months, you are underpriced.",
      ],
    },

    faq: {
      eyebrow: "Straight answers",
      title: "Pricing questions operators actually search",
      items: [
        {
          q: "How much should a coffee cart charge per event?",
          a: "Most professional carts land between $800 and $2,500 per event, driven by guest count, service hours, cart type, and travel. A 100-guest, 3-hour espresso cart event benchmarks around $1,105 at the market median — with value operators near $880 and premium carts near $1,480. Use the calculator above for your exact event shape.",
        },
        {
          q: "How many baristas do I need for 100 guests?",
          a: "Plan around throughput, not headcount: one barista comfortably pours 45–60 drinks an hour. 100 guests over 3 hours is roughly 150 drinks — about 50 an hour — which one skilled barista handles at a comfortable pace. Compress the same event into 2 hours and you'll want a second pair of hands.",
        },
        {
          q: "What is a typical coffee cart minimum?",
          a: "Two hours is the standard billing minimum, with base packages commonly starting around $600–$900 for smaller guest counts. Prep, load-in, and teardown cost you the same whether you pour for one hour or four — the minimum is what keeps short events from costing you money.",
        },
        {
          q: "Should I charge a travel fee?",
          a: "Yes — beyond your local radius, always. A common structure is a free radius of around 30 miles, then $2–$3 per mile beyond it. Fold travel into the base price and you're silently discounting every distant event.",
        },
        {
          q: "How much deposit should I take?",
          a: "25–50% at booking is standard, non-refundable inside your cancellation window. A real deposit filters out non-serious inquiries and protects the date you're turning other clients away from.",
        },
        {
          q: "Why do coffee carts have a 2-hour minimum?",
          a: "Because the expensive part isn't the pouring — it's everything around it. Load-in, water, power, dial-in, and teardown take the same effort for a 1-hour event as a 4-hour one. The 2-hour base package prices that fixed work honestly; extra hours are billed at a lower hourly rate on top.",
        },
      ],
    },
  },
} as const;

type CartTypeId = keyof typeof CONFIG.model.CART_TYPES;
type PositioningId = keyof typeof CONFIG.model.POSITIONING;
type AddonId = keyof typeof CONFIG.model.ADDONS;

const POSITIONING_IDS = ["value", "standard", "premium"] as const;

/* ============================ MODEL =================================== */

function computeQuote(args: {
  cartType: CartTypeId;
  positioning: PositioningId;
  guests: number;
  hours: number;
  miles: number;
  addons: AddonId[];
}) {
  const m = CONFIG.model;

  /* drinks & staffing */
  const totalDrinks = Math.round(args.guests * m.DRINKS_PER_GUEST);
  const drinksPerHour = totalDrinks / Math.max(1, args.hours);
  const baristas = Math.max(
    1,
    Math.ceil(drinksPerHour / m.THROUGHPUT_PER_BARISTA_HOUR),
  );
  const carts = Math.max(1, Math.ceil(baristas / m.CARTS_PER_BARISTA_GROUP));

  /* tiered base: 2-hour base package + hourly beyond. hours < 2 still
     pays the base — the 2-hour minimum. */
  const tier =
    m.TIERS.find((t) => args.guests <= t.maxGuests) ??
    m.TIERS[m.TIERS.length - 1];
  const basePrice = tier.base2hr + Math.max(0, args.hours - 2) * tier.extraHour;

  /* travel — rounded to whole dollars so every breakdown line is exact */
  const travelFee = Math.round(
    Math.max(0, args.miles - m.TRAVEL_FREE_RADIUS_MI) * m.TRAVEL_PER_MILE,
  );

  /* add-ons */
  const addonLines = args.addons.map((id) => {
    const a = m.ADDONS[id];
    const amount =
      a.type === "perGuest" ? Math.round(a.amount * args.guests) : a.amount;
    return { id, label: a.label, amount };
  });
  const addonsTotal = addonLines.reduce((sum, l) => sum + l.amount, 0);

  /* cart type + positioning */
  const subtotal = basePrice * m.CART_TYPES[args.cartType].multiplier;
  const priceFor = (p: PositioningId) =>
    Math.round(subtotal * m.POSITIONING[p].multiplier) +
    travelFee +
    addonsTotal;

  const recommended = priceFor(args.positioning);
  const prices = {
    value: priceFor("value"),
    standard: priceFor("standard"),
    premium: priceFor("premium"),
  };
  const basePositioned = Math.round(
    subtotal * m.POSITIONING[args.positioning].multiplier,
  );

  return {
    totalDrinks,
    drinksPerHour,
    baristas,
    carts,
    basePrice,
    basePositioned,
    travelFee,
    addonLines,
    addonsTotal,
    recommended,
    prices,
    perGuest: recommended / Math.max(1, args.guests),
    perDrink: recommended / Math.max(1, totalDrinks),
  };
}

type Quote = ReturnType<typeof computeQuote>;

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const guestsLabel = (g: number) =>
  g >= CONFIG.input.GUESTS_MAX ? `${CONFIG.input.GUESTS_MAX}+` : String(g);

/* ============================ MOTION ================================== */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* rolls a number toward its target with an ease-out — values never jump */
function useRollingNumber(target: number, reduced: boolean) {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef(0);
  useEffect(() => {
    if (reduced) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }
    const from = displayRef.current;
    if (from === target) return;
    const start = performance.now();
    const DURATION = 550;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = from + (target - from) * eased;
      displayRef.current = value;
      setDisplay(value);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, reduced]);
  return display;
}

function RollingMoney({
  value,
  reduced,
  className,
}: {
  value: number;
  reduced: boolean;
  className?: string;
}) {
  const display = useRollingNumber(value, reduced);
  return <span className={className}>{money(display)}</span>;
}

/* ============================ ATOMS =================================== */

function Eyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-4 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.3em] sm:text-xs ${
        dark ? "text-[#c6a66a]" : "text-[#8a6f3d]"
      }`}
    >
      <span aria-hidden="true" className="text-[0.8em]">
        ✦
      </span>
      {children}
      <span
        aria-hidden="true"
        className={`h-px flex-1 ${dark ? "bg-[#ededd5]/10" : "bg-[#261f15]/10"}`}
      />
    </p>
  );
}

/* Small tracked-caps section label — the worksheet's only chrome */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/45">
      {children}
    </p>
  );
}

function DriversSection({ reduced }: { reduced: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full overflow-hidden border-y border-[#261f15]/10 bg-[#ededd5] py-20 md:py-32">
      <Noise patternAlpha={10} />

      {/* Decorative Circular Blurs */}
      <div
        className={`absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] min-w-[400px] min-h-[400px] rounded-full bg-[#8a6f3d]/15 blur-[120px] pointer-events-none mix-blend-multiply ${!reduced ? "lec-spin-slow" : ""}`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full bg-[#261f15]/10 blur-[130px] pointer-events-none mix-blend-multiply ${!reduced ? "lec-spin-slow" : ""}`}
        style={{ animationDirection: "reverse" }}
      />

      <div className="relative z-20 mx-auto w-full max-w-[1200px] px-6 md:px-12">
        <motion.div
          initial={reduced ? false : { y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <Eyebrow>{CONFIG.copy.drivers.eyebrow}</Eyebrow>
          <h2 className="mt-8 font-heading font-thin not-italic leading-[1.05] tracking-[-0.02em] text-[clamp(2.5rem,4vw,3.5rem)] text-[#261f15]">
            {CONFIG.copy.drivers.title}
          </h2>
        </motion.div>

        <motion.div
          className="mt-16 md:mt-24 flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20"
          initial={reduced ? false : { y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile Accordion / Desktop Index */}
          <div className="w-full lg:w-[45%] shrink-0 border-y border-[#261f15]/20 divide-y divide-[#261f15]/10">
            {CONFIG.copy.drivers.items.map((item, i) => {
              const active = i === activeIndex;
              return (
                <div key={item.title} className="group relative">
                  <button
                    type="button"
                    aria-expanded={active}
                    aria-controls={`driver-panel-${i}`}
                    id={`driver-tab-${i}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full flex items-center justify-between py-5 lg:py-6 text-left cursor-pointer transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f] ${active ? "text-[#a3843f]" : "text-[#261f15]/60 hover:text-[#261f15]"}`}
                  >
                    <span className="flex items-center gap-6">
                      <span
                        className={`font-mono text-[0.8rem] tracking-widest tabular-nums transition-colors duration-300 ${active ? "text-[#a3843f]" : "text-[#8a6f3d]/60 group-hover:text-[#8a6f3d]"}`}
                      >
                        0{i + 1}
                      </span>
                      <span
                        className={`font-sans text-[0.78rem] uppercase tracking-[0.2em] font-semibold transition-colors duration-300 ${active ? "text-[#261f15]" : ""}`}
                      >
                        {item.title}
                      </span>
                    </span>
                    <span
                      className={`text-[0.78rem] transition-opacity duration-300 ${active ? "opacity-100 text-[#a3843f]" : "opacity-0"}`}
                    >
                      ✦
                    </span>
                  </button>
                  {/* Mobile expansion */}
                  <div
                    id={`driver-panel-${i}`}
                    role="region"
                    aria-labelledby={`driver-tab-${i}`}
                    className={`lg:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pl-12 pr-4 pt-2">
                      <p className="font-sans text-[0.85rem] leading-relaxed text-[#261f15]/75">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Plate — presented on a soft gold glow rising from below */}
          <div className="hidden lg:block relative w-full lg:w-[55%] min-h-[420px]">
            <div
              aria-hidden="true"
              className={`absolute -bottom-28 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#a3843f]/30 blur-[90px] pointer-events-none mix-blend-multiply ${!reduced ? "lec-spin-slow" : ""}`}
            />
            <div className="absolute inset-0 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={
                    reduced ? false : { opacity: 0, y: 15, filter: "blur(3px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    reduced
                      ? undefined
                      : { opacity: 0, y: -15, filter: "blur(3px)" }
                  }
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="px-10 py-12"
                >
                  <div className="flex items-center gap-6 mb-8">
                    <span className="font-mono text-sm text-[#8a6f3d] tracking-widest tabular-nums">
                      0{activeIndex + 1}
                    </span>
                    <div className="h-px flex-1 border-t border-dotted border-[#261f15]/40"></div>
                    <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/40">
                      Operator's Note
                    </span>
                  </div>
                  <h3 className="font-heading font-thin not-italic text-[2.75rem] text-[#261f15] mb-6 leading-[1.05]">
                    {CONFIG.copy.drivers.items[activeIndex].title}
                  </h3>
                  <p className="font-sans text-[1.05rem] leading-[1.8] text-[#261f15]/80">
                    {CONFIG.copy.drivers.items[activeIndex].body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* Two typeset ticket rows — the selected one takes a firm ✦ stamp.
   Full radio semantics: arrow keys move, Home/End jump. */
function TicketRadio({
  options,
  value,
  onChange,
  groupLabel,
}: {
  options: readonly { id: string; title: string; sub: string }[];
  value: string;
  onChange: (id: string) => void;
  groupLabel: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (i + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (i - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(options[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div role="radiogroup" aria-label={groupLabel}>
      {options.map((opt, i) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={i === selectedIndex ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, i)}
            onClick={() => onChange(opt.id)}
            className={`group mb-2.5 flex w-full cursor-pointer items-baseline gap-4 border px-5 py-3.5 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f] ${
              selected
                ? "border-[#a3843f] bg-[#a3843f]/[0.07]"
                : "border-[#261f15]/25 hover:border-[#261f15]/60"
            }`}
          >
            <span className="w-5 shrink-0 text-center">
              {selected && (
                <span
                  key={value}
                  aria-hidden="true"
                  className="lec-stampmark text-[0.85rem] leading-none"
                >
                  ✦
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span
                className={`block font-sans text-[0.85rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                  selected
                    ? "text-[#261f15]"
                    : "text-[#261f15]/40 group-hover:text-[#261f15]/70"
                }`}
              >
                {opt.title}
              </span>
              {selected && (
                <span className="mt-1 block font-sans text-[0.8rem] leading-relaxed text-[#261f15]/50">
                  {opt.sub}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* Three typeset columns — the active word takes a rotated ink-stamp
   outline. "Recommended" is a permanent footnote under Standard. */
function StampColumns({
  options,
  value,
  onChange,
  groupLabel,
}: {
  options: readonly {
    id: string;
    title: string;
    sub: string;
    badge?: string;
  }[];
  value: string;
  onChange: (id: string) => void;
  groupLabel: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );
  const selected = options[selectedIndex];

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (i + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (i - 1 + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(options[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={groupLabel}
        className="grid grid-cols-3 divide-x divide-[#261f15]/25 border border-[#261f15]/25"
      >
        {options.map((opt, i) => {
          const isSelected = opt.id === value;
          return (
            <button
              key={opt.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={i === selectedIndex ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onChange(opt.id)}
              className={`cursor-pointer py-3.5 text-center transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#a3843f] ${
                isSelected ? "bg-[#a3843f]/[0.07]" : "hover:bg-[#261f15]/[0.04]"
              }`}
            >
              {isSelected ? (
                <span
                  key={value}
                  className="lec-stamped font-sans text-[0.8rem] font-semibold uppercase tracking-[0.18em]"
                >
                  {opt.title}
                </span>
              ) : (
                <span className="inline-block px-3 py-[0.35rem] font-sans text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/40 transition-colors duration-200 hover:text-[#261f15]/70">
                  {opt.title}
                </span>
              )}
              {opt.badge && (
                <span className="mt-1.5 block font-sans text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/35">
                  {opt.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* one quiet line about the selected option — info without bulk */}
      <p className="mt-2 font-sans text-[0.8rem] leading-relaxed text-[#261f15]/50">
        {selected.sub}
      </p>
    </div>
  );
}

/* Slider + tap-to-type numeral + bare glyph steppers — typing 220 is
   exactly as easy as dragging. Commits valid values live, clamps on blur. */
function SliderRow({
  id,
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  maxIsPlus = false,
  note,
}: {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  maxIsPlus?: boolean;
  note?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const [text, setText] = useState(String(value));
  const focusedRef = useRef(false);
  useEffect(() => {
    if (!focusedRef.current) setText(String(value));
  }, [value]);

  const onTextChange = (raw: string) => {
    setText(raw);
    const v = Number(raw);
    if (raw.trim() !== "" && !Number.isNaN(v) && v >= min && v <= max) {
      onChange(Math.round(v));
    }
  };
  const onTextBlur = () => {
    focusedRef.current = false;
    const v = Number(text);
    if (text.trim() === "" || Number.isNaN(v)) {
      setText(String(value));
    } else {
      const c = clamp(Math.round(v));
      onChange(c);
      setText(String(c));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <label
          htmlFor={id}
          className="pb-1 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/55"
        >
          {label}
        </label>
        <div className="flex items-end gap-1">
          <button
            type="button"
            aria-label={`Decrease ${label.toLowerCase()}`}
            onClick={() => onChange(clamp(value - step))}
            className="lec-step"
          >
            −
          </button>
          <div className="flex items-baseline gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label={`${label} — type a number`}
              value={text}
              onFocus={() => {
                focusedRef.current = true;
              }}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={onTextBlur}
              className="w-[4.75rem] rounded-none border-0 border-b border-[#261f15]/30 bg-transparent px-1 pb-1 text-right font-heading not-italic text-4xl leading-none tracking-[-0.01em] text-[#261f15] tabular-nums transition-colors focus-visible:border-[#a3843f] focus-visible:outline-none"
            />
            <span className="pb-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/45">
              {maxIsPlus && value >= max ? `${unit}+` : unit}
            </span>
          </div>
          <button
            type="button"
            aria-label={`Increase ${label.toLowerCase()}`}
            onClick={() => onChange(clamp(value + step))}
            className="lec-step"
          >
            +
          </button>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lec-range mt-1"
        style={{ "--lec-fill": `${pct}%` } as React.CSSProperties}
      />
      {note && (
        <p className="font-sans text-[0.78rem] font-semibold leading-relaxed text-[#8a6f3d]">
          {note}
        </p>
      )}
    </div>
  );
}

/* A ledger line — small-caps label, dotted leader, tabular amount */
function LedgerLine({
  label,
  detail,
  amount,
  strong = false,
}: {
  label: string;
  detail?: string;
  amount: string;
  strong?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span
          className={`shrink-0 font-sans uppercase ${
            strong
              ? "text-[0.8rem] font-bold tracking-[0.2em] text-[#261f15]"
              : "text-[0.68rem] font-semibold tracking-[0.18em] text-[#261f15]/55"
          }`}
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          className="mb-[3px] min-w-4 flex-1 border-b border-dotted border-[#261f15]/30"
        />
        <span
          className={`shrink-0 font-heading not-italic leading-none tabular-nums ${
            strong ? "text-2xl text-[#261f15]" : "text-lg text-[#261f15]/85"
          }`}
        >
          {amount}
        </span>
      </div>
      {detail && (
        <p className="mt-1 font-sans text-[0.78rem] leading-snug text-[#261f15]/40">
          {detail}
        </p>
      )}
    </div>
  );
}

/* ---------- the event-date field — an unfolding printed calendar ------
   No free text: the field is a button and the calendar is the only
   input, so an invalid or past date is impossible. min = today; earlier
   days are muted and unselectable, and month navigation cannot go
   before the current month. Keyboard: arrows move a day, Home/End jump
   the week, PageUp/PageDown change month, Enter selects, Escape closes
   and returns focus to the field. Dependency-free, local-time safe,
   typeset entirely to the worksheet. ---------------------------------- */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fromISODate = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};
const startOfToday = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const daysInMonth = (m: Date) =>
  new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
const formatDateLong = (d: Date) =>
  `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? fromISODate(value) : null;
  const [viewMonth, setViewMonth] = useState(() => {
    const t = startOfToday();
    const base = selected && selected >= t ? selected : t;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [focusDay, setFocusDay] = useState(() => {
    const t = startOfToday();
    return selected && selected >= t ? selected : t;
  });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const today = startOfToday();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  /* keep DOM focus on the roving day while the calendar is open */
  const focusISO = toISODate(focusDay);
  useEffect(() => {
    if (!open) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${focusISO}"]`)
      ?.focus();
  }, [open, focusISO]);

  const openCalendar = () => {
    const base = selected && selected >= today ? selected : today;
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setFocusDay(base);
    setOpen(true);
  };
  const closeCalendar = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const moveFocus = (days: number) => {
    const next = new Date(
      focusDay.getFullYear(),
      focusDay.getMonth(),
      focusDay.getDate() + days,
    );
    const clamped = next < today ? today : next;
    setFocusDay(clamped);
    setViewMonth(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
  };
  const moveMonth = (delta: number) => {
    const m = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth() + delta,
      1,
    );
    if (m < thisMonth) return;
    const d = Math.min(focusDay.getDate(), daysInMonth(m));
    const f = new Date(m.getFullYear(), m.getMonth(), d);
    setViewMonth(m);
    setFocusDay(f < today ? today : f);
  };

  /* on the whole calendar (grid + month nav): Escape closes only the
     calendar, never the quote modal behind it */
  const onCalendarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeCalendar(true);
    }
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusDay >= today) {
        onChange(toISODate(focusDay));
        closeCalendar(true);
      }
      return;
    }
    const moves: Record<string, () => void> = {
      ArrowRight: () => moveFocus(1),
      ArrowLeft: () => moveFocus(-1),
      ArrowDown: () => moveFocus(7),
      ArrowUp: () => moveFocus(-7),
      Home: () => moveFocus(-focusDay.getDay()),
      End: () => moveFocus(6 - focusDay.getDay()),
      PageDown: () => moveMonth(1),
      PageUp: () => moveMonth(-1),
    };
    if (moves[e.key]) {
      e.preventDefault();
      moves[e.key]();
    }
  };

  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from(
      { length: daysInMonth(viewMonth) },
      (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1),
    ),
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const navClass =
    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-[#261f15]/30 font-sans text-base leading-none text-[#261f15]/70 transition-colors hover:border-[#a3843f] hover:text-[#261f15] disabled:cursor-default disabled:opacity-30 disabled:hover:border-[#261f15]/30 disabled:hover:text-[#261f15]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]";

  return (
    <div>
      <label
        htmlFor="lec-date-trigger"
        className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/50"
      >
        {label}
      </label>
      <button
        id="lec-date-trigger"
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="lec-date-calendar"
        onClick={() => (open ? closeCalendar(false) : openCalendar())}
        className="mt-2 flex w-full cursor-pointer items-baseline justify-between gap-4 border-b border-[#261f15]/30 py-2 text-left font-sans text-sm transition-colors hover:border-[#261f15]/60 focus-visible:border-[#a3843f] focus-visible:outline-none"
      >
        <span className={selected ? "text-[#261f15]" : "text-[#261f15]/35"}>
          {selected
            ? formatDateLong(selected)
            : CONFIG.copy.lead.datePlaceholder}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[0.78rem] text-[#8a6f3d] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          ✦
        </span>
      </button>

      {/* the calendar unfolds in-flow — no popover clipping, flawless
          inside the scrollable modal and at 375px */}
      <div
        className="lec-reveal"
        data-open={open}
        id="lec-date-calendar"
        aria-hidden={!open}
      >
        <div className="lec-reveal-inner">
          <div
            className="mt-4 border border-[#261f15]/25 px-4 pb-4 pt-4 sm:px-5"
            onKeyDown={onCalendarKeyDown}
          >
            {/* month masthead */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                aria-label="Previous month"
                disabled={viewMonth <= thisMonth}
                tabIndex={open ? 0 : -1}
                onClick={() => moveMonth(-1)}
                className={navClass}
              >
                ‹
              </button>
              <p className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]">
                {MONTH_NAMES[viewMonth.getMonth()]}{" "}
                <span
                  aria-hidden="true"
                  className="mx-1 text-[0.75em] text-[#8a6f3d]"
                >
                  ✦
                </span>{" "}
                <span className="tabular-nums">{viewMonth.getFullYear()}</span>
              </p>
              <button
                type="button"
                aria-label="Next month"
                tabIndex={open ? 0 : -1}
                onClick={() => moveMonth(1)}
                className={navClass}
              >
                ›
              </button>
            </div>

            {/* tracked-caps weekday labels over a fine rule */}
            <div className="mt-4 grid grid-cols-7 border-b border-[#261f15]/20 pb-2">
              {WEEKDAY_LABELS.map((w) => (
                <span
                  key={w}
                  className="text-center font-sans text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/40"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* the days — tabular numerals, past days muted */}
            <div
              ref={gridRef}
              role="grid"
              aria-label={label}
              onKeyDown={onGridKeyDown}
              className="mt-1"
            >
              {weeks.map((week, wi) => (
                <div key={wi} role="row" className="grid grid-cols-7">
                  {week.map((day, di) =>
                    day ? (
                      <button
                        key={di}
                        type="button"
                        role="gridcell"
                        data-day={toISODate(day)}
                        disabled={day < today}
                        tabIndex={open && sameDay(day, focusDay) ? 0 : -1}
                        aria-selected={
                          selected ? sameDay(day, selected) : false
                        }
                        aria-label={`${MONTH_NAMES[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`}
                        onClick={() => {
                          onChange(toISODate(day));
                          closeCalendar(true);
                        }}
                        className={`relative flex h-10 w-full cursor-pointer items-center justify-center font-heading not-italic text-sm tabular-nums transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#a3843f] disabled:cursor-default ${
                          selected && sameDay(day, selected)
                            ? "bg-[#a3843f] font-semibold text-[#261f15]"
                            : day < today
                              ? "text-[#261f15]/20"
                              : "text-[#261f15]/75 hover:bg-[#261f15]/[0.05] hover:text-[#261f15]"
                        }`}
                      >
                        {day.getDate()}
                        {sameDay(day, today) &&
                          !(selected && sameDay(day, selected)) && (
                            <span
                              aria-hidden="true"
                              className="absolute bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-[#8a6f3d]"
                            />
                          )}
                      </button>
                    ) : (
                      <span key={di} role="gridcell" aria-hidden="true" />
                    ),
                  )}
                </div>
              ))}
            </div>

            <p className="mt-3 border-t border-[#261f15]/15 pt-3 font-sans text-[0.65rem] leading-relaxed text-[#261f15]/45">
              {CONFIG.copy.lead.dateNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SUMMARY ================================= */

function buildSummary(args: {
  cartType: CartTypeId;
  positioning: PositioningId;
  guests: number;
  hours: number;
  miles: number;
  addons: AddonId[];
  quote: Quote;
}) {
  const cart = CONFIG.model.CART_TYPES[args.cartType].title;
  const pos = CONFIG.model.POSITIONING[args.positioning].title;
  const q = args.quote;
  const addonList =
    args.addons.length > 0
      ? q.addonLines.map((l) => `  - ${l.label}: ${money(l.amount)}`).join("\n")
      : "  none";
  return [
    `Coffee Catering Price Calculator — LocalEyes`,
    ``,
    `Event: ${cart} · ${pos} positioning`,
    `Guests: ${guestsLabel(args.guests)} · Service hours: ${args.hours} · Travel: ${args.miles} mi`,
    `Add-ons:`,
    addonList,
    ``,
    `Recommended price: ${money(q.recommended)}`,
    `Market range: ${money(q.prices.value)} – ${money(q.prices.premium)}`,
    `Per guest: ${money(q.perGuest)} · Per drink: $${q.perDrink.toFixed(2)} · Drinks served: ~${q.totalDrinks}`,
    `Suggested setup: ${q.baristas} barista${q.baristas === 1 ? "" : "s"} · ${q.carts} cart${q.carts === 1 ? "" : "s"} (~${Math.round(q.drinksPerHour)} drinks/hr)`,
    ``,
    CONFIG.links.CANONICAL_URL,
  ].join("\n");
}

/* ---- the client-ready quote document ------------------------------- */

function formatEventDate(iso: string) {
  if (!iso) return "To be confirmed";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "To be confirmed";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type QuoteRef = { num: string; date: string };

function buildQuoteText(args: {
  lead: {
    name: string;
    email: string;
    business: string;
    phone: string;
    client: string;
    date: string;
  };
  quoteRef: QuoteRef;
  cartTitle: string;
  posTitle: string;
  guests: number;
  hours: number;
  miles: number;
  quote: Quote;
  addonsTotal: number;
}) {
  const { lead, quoteRef, quote } = args;
  const biz = lead.business.trim() || "Mobile Coffee Catering";
  const pad = (label: string, amount: string) => {
    const dots = ".".repeat(Math.max(3, 42 - label.length - amount.length));
    return `${label} ${dots} ${amount}`;
  };
  const lines = [
    biz.toUpperCase(),
    `EVENT QUOTE · ${quoteRef.num} · Issued ${quoteRef.date}`,
    "",
    `Prepared for: ${lead.client.trim() || "Your event"}`,
    `Event date: ${formatEventDate(lead.date)}`,
    `Prepared by: ${lead.name.trim()}${lead.phone.trim() ? ` · ${lead.phone.trim()}` : ""} · ${lead.email.trim()}`,
    "",
    "Event details:",
    `  Service: ${args.cartTitle}`,
    `  Positioning: ${args.posTitle}`,
    `  Guests: ${guestsLabel(args.guests)}`,
    `  Service duration: ${args.hours} hour${args.hours === 1 ? "" : "s"}`,
    `  Travel allotted: ${args.miles} miles`,
    `  Estimated drinks: ~${quote.totalDrinks}`,
    `  On-site setup: ${quote.carts} cart${quote.carts === 1 ? "" : "s"} · ${quote.baristas} barista${quote.baristas === 1 ? "" : "s"}`,
    "",
    pad("Base service", money(quote.basePositioned)),
  ];
  if (quote.travelFee > 0) lines.push(pad("Travel", money(quote.travelFee)));
  if (args.addonsTotal > 0)
    lines.push(pad("Add-ons & upgrades", money(args.addonsTotal)));
  lines.push(
    pad("TOTAL", money(quote.recommended)),
    `Per guest: ${money(quote.perGuest)}`,
    "",
    "Quote valid 14 days · Prepared with LocalEyes",
  );
  return lines.join("\n");
}

function buildQuoteHtml(args: Parameters<typeof buildQuoteText>[0]) {
  const { lead, quoteRef, quote } = args;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const biz = esc(lead.business.trim() || "Mobile Coffee Catering");
  const row = (label: string, amount: string, strong = false) =>
    `<tr${strong ? ' class="total"' : ""}><td>${label}</td><td class="amt">${amount}</td></tr>`;
  const ledger = [
    row("Base service", money(quote.basePositioned)),
    quote.travelFee > 0 ? row("Travel", money(quote.travelFee)) : "",
    args.addonsTotal > 0
      ? row("Add-ons &amp; upgrades", money(args.addonsTotal))
      : "",
    row("Total", money(quote.recommended), true),
  ].join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${biz} — Event Quote ${esc(quoteRef.num)}</title>
<style>
  :root { --serif: "Ivy Presto Display", Georgia, "Times New Roman", serif; --sans: "Helvetica Neue", Arial, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #ededd5; color: #261f15; font-family: var(--sans); }
  .sheet { max-width: 760px; margin: 40px auto; background: #f4f1e3; border: 1px solid rgba(38,31,21,.15); padding: 56px 56px 40px; }
  .label { font-size: 10px; font-weight: 600; letter-spacing: .28em; text-transform: uppercase; color: #8a6f3d; }
  .masthead { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
  h1 { font-family: var(--serif); font-weight: 300; font-size: 34px; line-height: 1.1; letter-spacing: -0.02em; margin: 10px 0 0; }
  .ref { text-align: right; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: rgba(38,31,21,.6); font-variant-numeric: tabular-nums; }
  .ref p { margin: 2px 0; }
  .rules { margin-top: 22px; border-top: 2px solid #261f15; }
  .rules div { margin-top: 3px; border-top: 1px solid #261f15; }
  .block { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 40px; margin-top: 28px; }
  .block h2, section h2 { font-size: 10px; font-weight: 600; letter-spacing: .24em; text-transform: uppercase; color: rgba(38,31,21,.5); margin: 0 0 8px; }
  .block p, section p { margin: 0; font-size: 14px; line-height: 1.7; }
  .muted { color: rgba(38,31,21,.6); font-size: 12px; }
  section { margin-top: 28px; }
  .details { display: grid; grid-template-columns: 1fr 1fr; column-gap: 40px; margin-top: 6px; }
  .drow { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; border-bottom: 1px dotted rgba(38,31,21,.35); padding: 9px 0; font-size: 13px; }
  .drow span { color: rgba(38,31,21,.6); }
  .drow b { font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
  @media (max-width: 560px) { .details { grid-template-columns: 1fr; } }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-variant-numeric: tabular-nums; }
  td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid rgba(38,31,21,.15); }
  td.amt { text-align: right; }
  tr.total td { border-bottom: none; border-top: 2px solid #261f15; font-family: var(--serif); font-size: 24px; padding-top: 16px; }
  .foot { margin-top: 36px; padding-top: 14px; border-top: 1px solid rgba(38,31,21,.2); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: rgba(38,31,21,.55); text-align: center; }
  @media print { body { background: #fff; } .sheet { margin: 0 auto; border: none; background: #fff; } }
  @page { margin: 14mm; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="masthead">
      <div>
        <p class="label">✦ Event Quote</p>
        <h1>${biz}</h1>
      </div>
      <div class="ref">
        <p>${esc(quoteRef.num)}</p>
        <p>Issued ${esc(quoteRef.date)}</p>
      </div>
    </div>
    <div class="rules"><div></div></div>
    <div class="block">
      <div>
        <h2>Prepared for</h2>
        <p>${esc(lead.client.trim() || "Your event")}</p>
        <p class="muted">Event date · ${esc(formatEventDate(lead.date))}</p>
      </div>
      <div>
        <h2>Prepared by</h2>
        <p>${esc(lead.name.trim())}</p>
        <p class="muted">${esc(lead.email.trim())}${lead.phone.trim() ? ` · ${esc(lead.phone.trim())}` : ""}</p>
      </div>
    </div>
    <section>
      <h2>Event Details</h2>
      <div class="details">
        <div class="drow"><span>Service</span><b>${esc(args.cartTitle)}</b></div>
        <div class="drow"><span>Positioning</span><b>${esc(args.posTitle)}</b></div>
        <div class="drow"><span>Guests</span><b>${esc(guestsLabel(args.guests))}</b></div>
        <div class="drow"><span>Service duration</span><b>${args.hours} hour${args.hours === 1 ? "" : "s"}</b></div>
        <div class="drow"><span>Travel allotted</span><b>${args.miles} miles</b></div>
        <div class="drow"><span>Estimated drinks</span><b>~${quote.totalDrinks}</b></div>
        <div class="drow"><span>On-site setup</span><b>${quote.carts} cart${quote.carts === 1 ? "" : "s"} · ${quote.baristas} barista${quote.baristas === 1 ? "" : "s"}</b></div>
      </div>
    </section>
    <section>
      <h2>Investment</h2>
      <table>${ledger}</table>
      <p class="muted" style="text-align:right;margin-top:8px;">${money(quote.perGuest)} per guest</p>
    </section>
    <p class="foot">Quote valid 14 days · Prepared with LocalEyes ✦</p>
  </div>
</body>
</html>
`;
}

/* count-up total — runs once on reveal, tabular numerals, reduced-safe */
function CountUpMoney({ value, reduced }: { value: number; reduced: boolean }) {
  const [display, setDisplay] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return <>{money(display)}</>;
}

/* ============================ PAGE ==================================== */

export default function CoffeeCartCalculatorPage() {
  const reduced = usePrefersReducedMotion();

  /* -------- embed mode (?embed=1) — set after mount, SSR-safe -------- */
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    setEmbed(new URLSearchParams(window.location.search).get("embed") === "1");
  }, []);

  /* -------- calculator state ----------------------------------------- */
  const [cartType, setCartType] = useState<CartTypeId>("espresso");
  const [positioning, setPositioning] = useState<PositioningId>("standard");
  const [guests, setGuests] = useState<number>(CONFIG.input.GUESTS_DEFAULT);
  const [hours, setHours] = useState<number>(CONFIG.input.HOURS_DEFAULT);
  const [miles, setMiles] = useState<number>(CONFIG.input.MILES_DEFAULT);
  const [addons, setAddons] = useState<AddonId[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* quote modal deep link — ?modal=quote is a shareable URL. Opening
     pushes a history entry (tagged lecQuote) so Back closes the modal
     and Forward reopens it; closing from the UI pops our own entry
     when we pushed one, otherwise (direct visit) strips the param in
     place so the user stays on the page. */
  const openQuote = () => {
    if (!quoteOpen) {
      const url = new URL(window.location.href);
      url.searchParams.set("modal", "quote");
      window.history.pushState({ lecQuote: true }, "", url);
    }
    setQuoteOpen(true);
  };
  const closeQuote = () => {
    if (!quoteOpen) return; /* guard a rapid double-close double-back */
    setQuoteOpen(false);
    if (window.history.state?.lecQuote) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      if (url.searchParams.has("modal")) {
        url.searchParams.delete("modal");
        window.history.replaceState(window.history.state, "", url);
      }
    }
  };
  useEffect(() => {
    const sync = () =>
      setQuoteOpen(
        new URLSearchParams(window.location.search).get("modal") === "quote",
      );
    sync(); /* a direct visit to ?modal=quote opens the modal on load */
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  /* quote modal: lock body scroll, close on Escape, restore focus */
  useEffect(() => {
    if (!quoteOpen) return;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuote();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus?.();
    };
  }, [quoteOpen]);

  /* -------- lead form state ------------------------------------------ */
  const [lead, setLead] = useState({
    name: "",
    email: "",
    business: "",
    phone: "",
    client: "",
    date: "",
  });
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [quoteRef, setQuoteRef] = useState<QuoteRef | null>(null);
  const [quoteCopied, setQuoteCopied] = useState(false);

  const quote = useMemo(
    () => computeQuote({ cartType, positioning, guests, hours, miles, addons }),
    [cartType, positioning, guests, hours, miles, addons],
  );

  const toggleAddon = (id: AddonId) =>
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const resetAll = () => {
    setCartType("espresso");
    setPositioning("standard");
    setGuests(CONFIG.input.GUESTS_DEFAULT);
    setHours(CONFIG.input.HOURS_DEFAULT);
    setMiles(CONFIG.input.MILES_DEFAULT);
    setAddons([]);
    setLead({
      name: "",
      email: "",
      business: "",
      phone: "",
      client: "",
      date: "",
    });
    setLeadErrors({});
    setLeadStatus("idle");
    setQuoteRef(null);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(
        buildSummary({
          cartType,
          positioning,
          guests,
          hours,
          miles,
          addons,
          quote,
        }),
      );
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  /* ---- quote document tools ---------------------------------------- */
  const addonsTotal = quote.addonLines.reduce((s, l) => s + l.amount, 0);
  const quoteDocArgs = quoteRef
    ? {
        lead,
        quoteRef,
        cartTitle: CONFIG.model.CART_TYPES[cartType].title,
        posTitle: CONFIG.model.POSITIONING[positioning].title,
        guests,
        hours,
        miles,
        quote,
        addonsTotal,
      }
    : null;

  const printQuote = () => window.print();

  const downloadQuote = () => {
    if (!quoteDocArgs) return;
    const blob = new Blob([buildQuoteHtml(quoteDocArgs)], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quoteDocArgs.quoteRef.num}-event-quote.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyQuoteText = async () => {
    if (!quoteDocArgs) return;
    try {
      await navigator.clipboard.writeText(buildQuoteText(quoteDocArgs));
      setQuoteCopied(true);
      window.setTimeout(() => setQuoteCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const editDetails = () => {
    setLeadStatus("idle");
    setQuoteRef(null);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!lead.name.trim()) errors.name = CONFIG.copy.lead.errorRequired;
    if (!lead.email.trim()) errors.email = CONFIG.copy.lead.errorRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim()))
      errors.email = CONFIG.copy.lead.errorEmail;
    if (!lead.business.trim()) errors.business = CONFIG.copy.lead.errorRequired;
    setLeadErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLeadStatus("submitting");
    try {
      /* ------------------------------------------------------------
         TODO: point this at your CRM / email endpoint. The payload
         below has everything: the lead + the full quote summary.
         ------------------------------------------------------------ */
      const payload = {
        lead,
        summary: buildSummary({
          cartType,
          positioning,
          guests,
          hours,
          miles,
          addons,
          quote,
        }),
      };
      void payload; /* placeholder — no backend call yet */
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      const now = new Date();
      setQuoteRef({
        num: `Q-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        date: now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
      setLeadStatus("success");
    } catch {
      setLeadStatus("error");
    }
  };

  const cartMeta = CONFIG.model.CART_TYPES[cartType];
  const posMeta = CONFIG.model.POSITIONING[positioning];
  const setupSentence = `${quote.baristas} barista${quote.baristas === 1 ? "" : "s"} · ${quote.carts} cart${quote.carts === 1 ? "" : "s"} · serving ~${quote.totalDrinks} drinks over ${hours} hr${hours === 1 ? "" : "s"}. (~${Math.round(quote.drinksPerHour)} drinks/hr — ${CONFIG.copy.results.setupPace}.)`;

  /* FAQPage JSON-LD — generated from the same CONFIG copy */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CONFIG.copy.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  /* ==================== the calculator (shared by embed) ============= */
  const configLine = `${cartMeta.title} · ${posMeta.title} · ${guestsLabel(guests)} guests · ${hours} hr${hours === 1 ? "" : "s"} · ${miles} mi — ${money(quote.recommended)}`;

  const calculator = (
    <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
      {/* ------------- the worksheet — typeset, no boxes --------------- */}
      <div className="lg:col-span-7">
        <div className="flex flex-col gap-11">
          {/* cart type — two ticket rows */}
          <div>
            <SectionLabel>{CONFIG.copy.steps.cart.title}</SectionLabel>
            <div className="mt-3">
              <TicketRadio
                groupLabel={CONFIG.copy.steps.cart.title}
                options={(
                  Object.keys(CONFIG.model.CART_TYPES) as CartTypeId[]
                ).map((id) => ({
                  id: id as string,
                  title: CONFIG.model.CART_TYPES[id].title as string,
                  sub: CONFIG.model.CART_TYPES[id].sub as string,
                }))}
                value={cartType}
                onChange={(id) => setCartType(id as CartTypeId)}
              />
            </div>
          </div>

          {/* positioning — three typeset columns, ink-stamped active */}
          <div>
            <SectionLabel>{CONFIG.copy.steps.positioning.title}</SectionLabel>
            <div className="mt-3">
              <StampColumns
                groupLabel={CONFIG.copy.steps.positioning.title}
                options={POSITIONING_IDS.map((id) => ({
                  id: id as string,
                  title: CONFIG.model.POSITIONING[id].title as string,
                  sub: CONFIG.model.POSITIONING[id].sub as string,
                  badge:
                    id === "standard"
                      ? (CONFIG.model.POSITIONING.standard.badge as string)
                      : undefined,
                }))}
                value={positioning}
                onChange={(id) => setPositioning(id as PositioningId)}
              />
            </div>
          </div>

          {/* the event — three typeset slider rows */}
          <div>
            <SectionLabel>{CONFIG.copy.steps.event.title}</SectionLabel>
            <div className="mt-5 flex flex-col gap-8">
              <SliderRow
                id="lec-guests"
                label={CONFIG.copy.sliders.guests.label}
                unit="guests"
                min={CONFIG.input.GUESTS_MIN}
                max={CONFIG.input.GUESTS_MAX}
                step={CONFIG.input.GUESTS_STEP}
                value={guests}
                onChange={setGuests}
                maxIsPlus
              />
              <SliderRow
                id="lec-hours"
                label={CONFIG.copy.sliders.hours.label}
                unit="hrs"
                min={CONFIG.input.HOURS_MIN}
                max={CONFIG.input.HOURS_MAX}
                step={1}
                value={hours}
                onChange={setHours}
                note={
                  hours < CONFIG.model.MIN_BILLABLE_HOURS
                    ? CONFIG.copy.sliders.hours.minimumNote
                    : undefined
                }
              />
              <SliderRow
                id="lec-miles"
                label={CONFIG.copy.sliders.miles.label}
                unit="mi"
                min={CONFIG.input.MILES_MIN}
                max={CONFIG.input.MILES_MAX}
                step={CONFIG.input.MILES_STEP}
                value={miles}
                onChange={setMiles}
              />
            </div>
          </div>

          {/* add-ons — a paper order-form checklist, always open */}
          <div>
            <div className="flex w-full items-baseline justify-between gap-4 border border-[#261f15]/25 px-5 py-3.5">
              <span className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.3em] text-[#261f15]/50">
                {CONFIG.copy.steps.addons.title} (
                {CONFIG.copy.steps.addons.optional})
              </span>
              <span className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#261f15]/50 tabular-nums">
                {addons.length > 0 ? `${addons.length} selected` : "None"}
              </span>
            </div>
            <div id="lec-addons-panel">
              <div className="grid grid-cols-1 gap-x-10 pt-3 sm:grid-cols-2">
                {(Object.keys(CONFIG.model.ADDONS) as AddonId[]).map((id) => {
                  const addon = CONFIG.model.ADDONS[id];
                  const selected = addons.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleAddon(id)}
                      className="group -mx-2 flex w-full cursor-pointer items-baseline gap-3 px-2 py-2.5 text-left transition-colors duration-200 hover:bg-[#261f15]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]"
                    >
                      <span
                        aria-hidden="true"
                        className={`relative top-[3px] flex h-[17px] w-[17px] shrink-0 items-center justify-center border transition-colors duration-200 ${
                          selected
                            ? "border-[#a3843f]"
                            : "border-[#261f15]/35 group-hover:border-[#261f15]/70"
                        }`}
                      >
                        {selected && (
                          <span className="lec-stampmark text-[0.8rem] leading-none">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block font-sans text-[0.85rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
                            selected
                              ? "text-[#261f15]"
                              : "text-[#261f15]/60 group-hover:text-[#261f15]"
                          }`}
                        >
                          {addon.label}
                        </span>
                        <span className="block font-sans text-[0.78rem] leading-snug text-[#261f15]/45">
                          {addon.sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------- the ledger — the TOTAL block of a rate card ----- */}
      <div className="lg:col-span-4 lg:col-start-9">
        <div className={embed ? "lg:sticky lg:top-6" : "lg:sticky lg:top-24"}>
          <div className="relative">
            {/* the one allowed rule — a double masthead rule */}
            <div className="border-t-2 border-[#261f15]" />
            <div className="mt-[3px] border-t border-[#261f15]" />
            {/* print device no. 1 — the EST. RATE stamp */}
            <span aria-hidden="true" className="lec-estrate">
              Est. Rate
            </span>

            <div className="pt-6">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#261f15]/50">
                {CONFIG.copy.results.recommendedLabel}
              </p>
              <p className="mt-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/40">
                {posMeta.title} · {cartMeta.title}
              </p>

              {/* THE price — enormous tabular numerals, the accent */}
              <p className="mt-4 font-heading font-thin not-italic leading-none tracking-[-0.02em] tabular-nums text-[clamp(3.8rem,4.6vw,5.4rem)] text-[#a3843f]">
                <RollingMoney value={quote.recommended} reduced={reduced} />
              </p>
              <p className="mt-3 font-sans text-[0.8rem] leading-relaxed text-[#261f15]/55">
                {CONFIG.copy.results.rangePrefix}{" "}
                <span className="font-semibold text-[#261f15]/80 tabular-nums">
                  {money(quote.prices.value)} – {money(quote.prices.premium)}
                </span>
              </p>

              {/* screen readers hear final values, not the roll */}
              <p className="sr-only" aria-live="polite">
                Recommended price {money(quote.recommended)}. Market range{" "}
                {money(quote.prices.value)} to {money(quote.prices.premium)}.{" "}
                {money(quote.perGuest)} per guest. ${quote.perDrink.toFixed(2)}{" "}
                per drink. {quote.totalDrinks} drinks served.
              </p>

              {/* per-guest / per-drink / drinks — typeset row */}
              <div className="mt-7 flex gap-9">
                {[
                  {
                    label: CONFIG.copy.results.chips.perGuest,
                    value: money(quote.perGuest),
                  },
                  {
                    label: CONFIG.copy.results.chips.perDrink,
                    value: `$${quote.perDrink.toFixed(2)}`,
                  },
                  {
                    label: CONFIG.copy.results.chips.drinks,
                    value: String(quote.totalDrinks),
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-heading not-italic text-xl leading-none tabular-nums text-[#261f15] sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* compare positioning — typeset columns, stamped active */}
              <div className="mt-8">
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#261f15]/45">
                  {CONFIG.copy.results.compareLabel}
                </p>
                <div className="mt-3 grid grid-cols-3 divide-x divide-[#261f15]/25 border border-[#261f15]/25">
                  {POSITIONING_IDS.map((id) => {
                    const active = id === positioning;
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setPositioning(id)}
                        className={`cursor-pointer px-2 py-2.5 text-center transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#a3843f] ${
                          active
                            ? "bg-[#a3843f]/[0.07]"
                            : "hover:bg-[#261f15]/[0.04]"
                        }`}
                      >
                        <span
                          className={`block font-sans text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${
                            active ? "text-[#a3843f]" : "text-[#261f15]/40"
                          }`}
                        >
                          {CONFIG.model.POSITIONING[id].title}
                        </span>
                        <span
                          className={`mt-1 block font-heading not-italic text-lg leading-none tabular-nums transition-colors duration-200 ${
                            active ? "text-[#261f15]" : "text-[#261f15]/50"
                          }`}
                        >
                          {money(quote.prices[id])}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* the ledger — every line traceable */}
              <div className="mt-8">
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#261f15]/45">
                  {CONFIG.copy.results.breakdownLabel}
                </p>
                <div className="mt-4 flex flex-col gap-3.5">
                  <LedgerLine
                    label={CONFIG.copy.results.baseLine}
                    detail={`${cartMeta.title} · ${guestsLabel(guests)} guests · ${hours} hr${hours === 1 ? "" : "s"}`}
                    amount={money(quote.basePositioned)}
                  />
                  {quote.travelFee > 0 && (
                    <LedgerLine
                      label={CONFIG.copy.results.travelLine}
                      detail={`${Math.max(0, miles - CONFIG.model.TRAVEL_FREE_RADIUS_MI)} mi beyond the ${CONFIG.model.TRAVEL_FREE_RADIUS_MI}-mi radius`}
                      amount={money(quote.travelFee)}
                    />
                  )}
                  {quote.addonLines.map((line) => (
                    <LedgerLine
                      key={line.id}
                      label={line.label}
                      amount={money(line.amount)}
                    />
                  ))}
                  {/* total closes with its own double rule */}
                  <div className="mt-1 border-t border-[#261f15]/60 pt-[3px]">
                    <div className="border-t border-[#261f15]/60 pt-3">
                      <LedgerLine
                        label={CONFIG.copy.results.totalLine}
                        amount={money(quote.recommended)}
                        strong
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* suggested setup — a footnote, not a callout */}
              <p className="mt-6 font-sans text-[0.8rem] leading-relaxed text-[#261f15]/50">
                N.B. — {setupSentence}
              </p>

              {/* print device no. 2 — the perforated ticket CTA */}
              <button
                type="button"
                onClick={openQuote}
                className="group mt-7 flex w-full cursor-pointer items-stretch text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
              >
                <span className="flex flex-1 items-center bg-[#b5965a] px-6 py-4 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-300 group-hover:bg-[#a3843f]">
                  {CONFIG.copy.lead.heading}
                </span>
                <span className="relative flex items-center border-l border-dashed border-white/50 bg-[#b5965a] px-5 font-heading not-italic text-lg leading-none tabular-nums text-white transition-colors duration-300 group-hover:bg-[#a3843f]">
                  {money(quote.recommended)}
                  <span
                    aria-hidden="true"
                    className="lec-notch lec-notch-top"
                  />
                  <span
                    aria-hidden="true"
                    className="lec-notch lec-notch-bottom"
                  />
                </span>
              </button>
              <div className="mt-4 flex items-baseline gap-7">
                <button
                  type="button"
                  onClick={copySummary}
                  className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/55 transition-colors hover:border-[#261f15]/70 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                >
                  {summaryCopied
                    ? CONFIG.copy.lead.copied
                    : CONFIG.copy.lead.copySummary}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/55 transition-colors hover:border-[#261f15]/70 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                >
                  {CONFIG.copy.lead.startOver}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ==================== QUOTE MODAL — a paper order form ============== */
  const quoteModal = (
    <AnimatePresence>
      {quoteOpen && (
        <div className="lec-modal-layer fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:px-6">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={closeQuote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            className="absolute inset-0 cursor-pointer bg-[#261f15]/55 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={CONFIG.copy.lead.heading}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
            transition={{
              duration: reduced ? 0 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`relative z-10 flex max-h-[92dvh] w-full flex-col bg-[#ededd5] px-6 pt-7 text-[#261f15] shadow-2xl sm:px-10 sm:pt-9 ${leadStatus === "success" ? "max-w-3xl" : "max-w-2xl"}`}
          >
            {/* the form's own masthead — stays put above the scroll */}
            <div className="border-t-2 border-[#261f15]" />
            <div className="mt-[3px] border-t border-[#261f15]" />
            <div className="mt-6 flex items-start justify-between gap-6">
              <div>
                <h2 className="font-heading font-thin not-italic text-2xl leading-tight sm:text-3xl">
                  {CONFIG.copy.lead.heading}
                </h2>
                {/* pre-filled with their exact configuration */}
                <p className="mt-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] leading-relaxed text-[#261f15]/50 tabular-nums">
                  {configLine}
                </p>
              </div>
              <button
                type="button"
                onClick={closeQuote}
                className="mt-1 shrink-0 cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/55 transition-colors hover:border-[#261f15]/70 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
              >
                Close
              </button>
            </div>

            {/* only the body scrolls — behind a thin brand-gold scrollbar */}
            <div className="lec-modal-scroll -mr-2 min-h-0 flex-1 overflow-y-auto pb-10 pr-2 sm:-mr-4 sm:pb-12 sm:pr-4">
              {leadStatus !== "success" && (
                <p className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-[#261f15]/65">
                  {CONFIG.copy.lead.body}
                </p>
              )}

              <div className="mt-8">
                {leadStatus === "success" && quoteRef ? (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <p className="font-sans text-xs leading-relaxed text-[#261f15]/60">
                      {CONFIG.copy.lead.successBody}{" "}
                      <strong>{lead.email}</strong>. Here is your client-ready
                      quote:
                    </p>

                    {/* ============ THE DOCUMENT — one typeset page ======= */}
                    <div
                      id="lec-quote-doc"
                      className="mt-6 border border-[#261f15]/15 bg-[#f4f1e3] px-6 py-8 sm:px-10 sm:py-12"
                    >
                      {/* masthead */}
                      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#8a6f3d]">
                            <span aria-hidden="true" className="text-[0.9em]">
                              ✦
                            </span>
                            Event Quote
                          </p>
                          <h3 className="mt-3 font-heading font-thin not-italic leading-[1.1] tracking-[-0.02em] text-[clamp(1.6rem,4.5vw,2.4rem)]">
                            {lead.business.trim() || "Mobile Coffee Catering"}
                          </h3>
                        </div>
                        <div className="text-right font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/60 tabular-nums">
                          <p>{quoteRef.num}</p>
                          <p className="mt-1">Issued {quoteRef.date}</p>
                        </div>
                      </div>
                      <div className="mt-6 border-t-2 border-[#261f15]" />
                      <div className="mt-[3px] border-t border-[#261f15]" />

                      {/* prepared for / prepared by */}
                      <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                        <div>
                          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/50">
                            Prepared for
                          </p>
                          <p className="mt-2 font-sans text-sm leading-relaxed text-[#261f15]">
                            {lead.client.trim() || "Your event"}
                          </p>
                          <p className="mt-1 font-sans text-xs leading-relaxed text-[#261f15]/60 tabular-nums">
                            Event date · {formatEventDate(lead.date)}
                          </p>
                        </div>
                        <div>
                          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/50">
                            Prepared by
                          </p>
                          <p className="mt-2 font-sans text-sm leading-relaxed text-[#261f15]">
                            {lead.name.trim()}
                          </p>
                          <p className="mt-1 break-words font-sans text-xs leading-relaxed text-[#261f15]/60 tabular-nums">
                            {lead.email.trim()}
                            {lead.phone.trim() ? ` · ${lead.phone.trim()}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* event details — a scannable worksheet grid */}
                      <div className="mt-8">
                        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/50">
                          Event Details
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                          {[
                            { label: "Service", value: cartMeta.title },
                            { label: "Positioning", value: posMeta.title },
                            { label: "Guests", value: guestsLabel(guests) },
                            {
                              label: "Service duration",
                              value: `${hours} hour${hours === 1 ? "" : "s"}`,
                            },
                            {
                              label: "Travel allotted",
                              value: `${miles} miles`,
                            },
                            {
                              label: "Estimated drinks",
                              value: `~${quote.totalDrinks}`,
                            },
                            {
                              label: "On-site setup",
                              value: `${quote.carts} cart${quote.carts === 1 ? "" : "s"} · ${quote.baristas} barista${quote.baristas === 1 ? "" : "s"}`,
                            },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className="flex items-baseline justify-between gap-4 border-b border-dotted border-[#261f15]/30 py-3"
                            >
                              <span className="shrink-0 font-sans text-xs text-[#261f15]/60">
                                {row.label}
                              </span>
                              <span className="text-right font-sans text-sm font-semibold text-[#261f15] tabular-nums">
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* the ledger */}
                      <div className="mt-8">
                        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/50">
                          Investment
                        </p>
                        <dl className="mt-3">
                          <div className="flex items-baseline justify-between gap-4 border-b border-[#261f15]/15 py-3">
                            <dt className="font-sans text-sm text-[#261f15]">
                              Base service
                            </dt>
                            <dd className="font-sans text-sm text-[#261f15] tabular-nums">
                              {money(quote.basePositioned)}
                            </dd>
                          </div>
                          {quote.travelFee > 0 && (
                            <div className="flex items-baseline justify-between gap-4 border-b border-[#261f15]/15 py-3">
                              <dt className="font-sans text-sm text-[#261f15]">
                                Travel
                              </dt>
                              <dd className="font-sans text-sm text-[#261f15] tabular-nums">
                                {money(quote.travelFee)}
                              </dd>
                            </div>
                          )}
                          {addonsTotal > 0 && (
                            <div className="flex items-baseline justify-between gap-4 border-b border-[#261f15]/15 py-3">
                              <dt className="font-sans text-sm text-[#261f15]">
                                Add-ons &amp; upgrades
                              </dt>
                              <dd className="font-sans text-sm text-[#261f15] tabular-nums">
                                {money(addonsTotal)}
                              </dd>
                            </div>
                          )}
                          <div className="mt-1 flex items-baseline justify-between gap-4 border-t-2 border-[#261f15] pt-4">
                            <dt className="font-heading font-thin not-italic text-xl sm:text-2xl">
                              Total
                            </dt>
                            <dd className="font-heading font-thin not-italic text-2xl tabular-nums sm:text-3xl">
                              <CountUpMoney
                                value={quote.recommended}
                                reduced={reduced}
                              />
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-2 text-right font-sans text-xs text-[#261f15]/55 tabular-nums">
                          {money(quote.perGuest)} per guest
                        </p>
                      </div>

                      {/* foot */}
                      <p className="mt-10 flex items-center justify-center gap-2 border-t border-[#261f15]/20 pt-4 text-center font-sans text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#261f15]/55">
                        Quote valid 14 days · Prepared with LocalEyes
                        <span
                          aria-hidden="true"
                          className="text-[0.9em] text-[#8a6f3d]"
                        >
                          ✦
                        </span>
                      </p>
                    </div>

                    {/* ============ DOCUMENT TOOLS ======================== */}
                    <div className="lec-quote-actions mt-7 flex flex-wrap items-baseline gap-x-7 gap-y-4">
                      <button
                        type="button"
                        onClick={printQuote}
                        className="cursor-pointer bg-[#a3843f] px-6 py-3 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#261f15] transition-colors hover:bg-[#8a6f3d] hover:text-[#ededd5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]"
                      >
                        Print / PDF
                      </button>
                      <button
                        type="button"
                        onClick={downloadQuote}
                        className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/70 transition-colors hover:border-[#a3843f] hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={copyQuoteText}
                        className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/70 transition-colors hover:border-[#a3843f] hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                      >
                        {quoteCopied ? CONFIG.copy.lead.copied : "Copy text"}
                      </button>
                      <button
                        type="button"
                        onClick={copySummary}
                        className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/70 transition-colors hover:border-[#a3843f] hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                      >
                        {summaryCopied
                          ? CONFIG.copy.lead.copied
                          : CONFIG.copy.lead.copySummary}
                      </button>
                      <button
                        type="button"
                        onClick={editDetails}
                        className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/70 transition-colors hover:border-[#a3843f] hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                      >
                        Edit details
                      </button>
                      <button
                        type="button"
                        onClick={resetAll}
                        className="cursor-pointer border-b border-[#261f15]/30 pb-0.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#261f15]/55 transition-colors hover:border-[#261f15]/70 hover:text-[#261f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                      >
                        {CONFIG.copy.lead.startOver}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={submitLead}
                    className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
                  >
                    {[
                      {
                        id: "name",
                        label: CONFIG.copy.lead.fields.name,
                        type: "text",
                      },
                      {
                        id: "email",
                        label: CONFIG.copy.lead.fields.email,
                        type: "email",
                      },
                      {
                        id: "business",
                        label: CONFIG.copy.lead.fields.business,
                        type: "text",
                        full: true,
                      },
                      {
                        id: "phone",
                        label: CONFIG.copy.lead.fields.phone,
                        type: "tel",
                      },
                      {
                        id: "client",
                        label: CONFIG.copy.lead.fields.client,
                        type: "text",
                      },
                    ].map((f, fi) => (
                      <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
                        <label
                          htmlFor={`lead-${f.id}`}
                          className="flex items-baseline justify-between font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#261f15]/50"
                        >
                          {f.label}
                          {leadErrors[f.id] && (
                            <span className="text-[#a3843f]">
                              {leadErrors[f.id]}
                            </span>
                          )}
                        </label>
                        <input
                          id={`lead-${f.id}`}
                          type={f.type}
                          autoFocus={fi === 0}
                          value={lead[f.id as keyof typeof lead]}
                          onChange={(e) =>
                            setLead({ ...lead, [f.id]: e.target.value })
                          }
                          className={`mt-2 w-full rounded-none border-0 border-b bg-transparent px-0 py-2 font-sans text-sm text-[#261f15] transition-colors focus-visible:border-[#a3843f] focus-visible:outline-none ${
                            leadErrors[f.id]
                              ? "border-[#a3843f]"
                              : "border-[#261f15]/30"
                          }`}
                        />
                      </div>
                    ))}
                    {/* event date — button + unfolding calendar, no free text */}
                    <div className="sm:col-span-2">
                      <DateField
                        label={CONFIG.copy.lead.fields.date}
                        value={lead.date}
                        onChange={(iso) => setLead({ ...lead, date: iso })}
                      />
                    </div>
                    {leadStatus === "error" && (
                      <div className="sm:col-span-2">
                        <p className="font-sans text-xs text-[#a3843f]">
                          {CONFIG.copy.lead.errorSubmit}
                        </p>
                      </div>
                    )}
                    <div className="mt-2 sm:col-span-2">
                      <button
                        type="submit"
                        disabled={leadStatus === "submitting"}
                        className="group flex w-full cursor-pointer items-stretch text-left disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f]"
                      >
                        <span className="flex flex-1 items-center justify-center bg-[#a3843f] px-6 py-4 text-center font-sans text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-[#261f15] transition-colors duration-300 group-hover:bg-[#8a6f3d] group-hover:text-[#ededd5]">
                          {leadStatus === "submitting"
                            ? "..."
                            : CONFIG.copy.lead.submit}
                        </span>
                        <span className="relative flex items-center border-l border-dashed border-[#261f15]/40 bg-[#a3843f] px-5 font-heading not-italic text-lg leading-none tabular-nums text-[#261f15] transition-colors duration-300 group-hover:bg-[#8a6f3d] group-hover:text-[#ededd5]">
                          {money(quote.recommended)}
                          <span
                            aria-hidden="true"
                            className="lec-notch lec-notch-top"
                          />
                          <span
                            aria-hidden="true"
                            className="lec-notch lec-notch-bottom"
                          />
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  /* ==================== MOBILE PRICE BAR — a ledger strip ============= */
  const mobileBar = (
    <div className="fixed inset-x-0 bottom-0 z-[60] lg:hidden">
      <div className="bg-[#ededd5]">
        {/* masthead rule separates the strip from the page */}
        <div className="border-t-2 border-[#261f15]" />
        <div className="mt-[3px] border-t border-[#261f15]" />
        {/* tap the price to expand a compact ledger */}
        <div
          className="lec-reveal"
          data-open={mobileOpen}
          id="lec-mobile-panel"
        >
          <div className="lec-reveal-inner">
            <div className="mx-auto w-full max-w-[1480px] px-6 pt-5">
              <div className="flex flex-col gap-3 pb-2">
                <LedgerLine
                  label={CONFIG.copy.results.baseLine}
                  amount={money(quote.basePositioned)}
                />
                {quote.travelFee > 0 && (
                  <LedgerLine
                    label={CONFIG.copy.results.travelLine}
                    amount={money(quote.travelFee)}
                  />
                )}
                {quote.addonLines.map((line) => (
                  <LedgerLine
                    key={line.id}
                    label={line.label}
                    amount={money(line.amount)}
                  />
                ))}
                <LedgerLine
                  label={CONFIG.copy.results.totalLine}
                  amount={money(quote.recommended)}
                  strong
                />
              </div>
              <p className="pb-1 font-sans text-[0.68rem] leading-relaxed text-[#261f15]/50 tabular-nums">
                {money(quote.perGuest)} per guest · ${quote.perDrink.toFixed(2)}{" "}
                per drink · ~{quote.totalDrinks} drinks
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1480px] items-center gap-3 px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="lec-mobile-panel"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a3843f]"
          >
            <span
              aria-hidden="true"
              className="w-3 shrink-0 text-center font-sans text-sm leading-none text-[#261f15]/50"
            >
              {mobileOpen ? "−" : "+"}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-sans text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#261f15]/50">
                {CONFIG.copy.results.recommendedLabel}
              </span>
              <span className="block font-heading not-italic text-2xl leading-tight tabular-nums text-[#a3843f]">
                <RollingMoney value={quote.recommended} reduced={reduced} />
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={openQuote}
            className="shrink-0 cursor-pointer bg-[#b5965a] px-6 py-3.5 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#a3843f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#261f15]"
          >
            {CONFIG.copy.lead.ctaShort}
          </button>
        </div>
      </div>
    </div>
  );

  /* ==================== EMBED MODE =================================== */
  if (embed) {
    return (
      <main className="relative min-h-[100dvh] w-full overflow-x-clip bg-[#ededd5] px-5 py-8 text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15] sm:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <PageStyles />
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="font-heading font-thin not-italic leading-tight tracking-[-0.02em] text-[clamp(1.6rem,3.4vw,2.4rem)]">
            {CONFIG.copy.calcHeading}
          </h1>
          <p className="mt-2 max-w-xl font-sans text-xs leading-relaxed text-[#261f15]/55">
            {CONFIG.copy.calcSub}
          </p>
          <div className="mt-8">{calculator}</div>
          <p className="mt-8 flex items-center gap-2 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#261f15]/50">
            <span aria-hidden="true" className="text-[0.8em] text-[#8a6f3d]">
              ✦
            </span>
            <a
              href={CONFIG.links.CANONICAL_URL}
              target="_blank"
              rel="noopener"
              className="border-b border-[#a3843f]/50 pb-0.5 transition-colors duration-300 hover:border-[#a3843f] hover:text-[#261f15]"
            >
              {CONFIG.copy.embed.poweredBy}
            </a>
          </p>
        </div>
        <div aria-hidden="true" className="h-24 lg:hidden" />
        {quoteModal}
        {mobileBar}
      </main>
    );
  }

  /* ==================== FULL PAGE ==================================== */
  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-clip bg-[#ededd5] text-[#261f15] selection:bg-[#c9932b] selection:text-[#261f15]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageStyles />

      {/* ================= 1. OPENER ================================== */}
      <section className="relative w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 mx-auto flex w-full max-w-[1480px] justify-between px-6 md:px-12"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-full w-px bg-[#261f15]/[0.05]" />
          ))}
        </div>
        <Noise patternAlpha={10} />

        {/* Soft blurred circle in contrast color filling the bottom-left empty space */}
        <div
          className={`absolute bottom-[-15%] left-[-5%] w-[26vw] h-[26vw] max-w-[420px] max-h-[420px] min-w-[240px] min-h-[240px] rounded-full bg-[#a3843f]/30 blur-[90px] pointer-events-none mix-blend-multiply ${!reduced ? "lec-spin-slow" : ""}`}
          aria-hidden="true"
        />

        <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 pb-10 pt-28 md:px-12 md:pb-14 md:pt-36">
          <motion.div
            initial={
              reduced ? false : { filter: "blur(4px)", letterSpacing: "0.5em" }
            }
            animate={{ filter: "blur(0)", letterSpacing: "0.3em" }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Eyebrow>Free Operator Tool</Eyebrow>
          </motion.div>
          <motion.p
            initial={reduced ? false : { y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-2xl font-sans text-[0.82rem] font-semibold uppercase leading-relaxed tracking-[0.18em] text-[#8a6f3d] sm:text-xs md:mt-10"
          >
            {CONFIG.copy.eyebrow}
          </motion.p>
          <motion.h1
            initial={reduced ? false : { y: 30, rotate: 2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-heading font-thin not-italic leading-[1.02] tracking-[-0.02em] text-[clamp(2.8rem,6.5vw,6rem)] origin-bottom-left"
          >
            {CONFIG.copy.h1}
          </motion.h1>
          {/* intro pushed right — deliberate asymmetry */}
          <div className="mt-8 flex md:justify-end md:mt-12">
            <motion.div
              initial={reduced ? false : { y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <p className="font-sans text-sm leading-relaxed text-[#261f15]/75 md:text-base">
                {CONFIG.copy.intro}
              </p>
              <p className="mt-8 flex items-start gap-3 font-sans text-[0.78rem] font-semibold uppercase leading-loose tracking-[0.16em] text-[#8a6f3d]">
                <span aria-hidden="true" className="mt-1 text-[0.8em]">
                  ✦
                </span>
                {CONFIG.copy.trustLine}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 2. THE CALCULATOR ========================== */}
      <section id="calculator" className="relative w-full">
        <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 pb-24 pt-10 md:px-12 md:pb-32 md:pt-16">
          <div className="max-w-2xl">
            <h2 className="font-heading font-thin not-italic leading-[1.05] tracking-[-0.02em] text-[clamp(2.2rem,4vw,3.6rem)]">
              {CONFIG.copy.calcHeading}
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#261f15]/60">
              {CONFIG.copy.calcSub}
            </p>
          </div>
          <div className="mt-10 md:mt-12">{calculator}</div>
        </div>
      </section>

      {/* ================= 4. WHAT DRIVES PRICING ===================== */}
      <DriversSection reduced={reduced} />

      {/* ================= 5. HOW CARTS UNDERPRICE ==================== */}
      <section className="relative w-full overflow-hidden">
        <Noise patternAlpha={9} />
        <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 pb-24 pt-24 md:px-12 md:pb-32 md:pt-36">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
            <motion.div
              className="md:col-span-5"
              initial={reduced ? false : { y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Eyebrow>{CONFIG.copy.underprice.eyebrow}</Eyebrow>
              <h2 className="mt-8 font-heading font-thin not-italic leading-[1.05] tracking-[-0.02em] text-[clamp(2.2rem,3.6vw,3.6rem)] md:mt-10">
                {CONFIG.copy.underprice.title}
              </h2>
            </motion.div>
            <motion.div
              className="flex flex-col gap-8 md:col-span-6 md:col-start-7 md:pt-4"
              initial={reduced ? false : { y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {CONFIG.copy.underprice.body.map((para) => (
                <p
                  key={para.slice(0, 24)}
                  className="font-sans text-sm leading-relaxed text-[#261f15]/75 md:text-base"
                >
                  {para}
                </p>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 6. FAQ ===================================== */}
      <section className="relative w-full overflow-hidden bg-[#ededd5]">
        <Noise patternAlpha={10} />

        {/* Soft gold blurred circles */}
        <div
          className={`absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] min-w-[400px] min-h-[400px] rounded-full bg-[#a3843f]/10 blur-[140px] pointer-events-none mix-blend-multiply ${!reduced ? "lec-spin-slow" : ""}`}
          aria-hidden="true"
        />
        <div
          className={`absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] min-w-[300px] min-h-[300px] rounded-full bg-[#8a6f3d]/15 blur-[120px] pointer-events-none mix-blend-multiply ${!reduced ? "lec-spin-slow" : ""}`}
          style={{ animationDirection: "reverse" }}
          aria-hidden="true"
        />

        <div className="relative z-20 mx-auto w-full max-w-[1480px] px-6 pb-32 pt-10 md:px-12 md:pb-48">
          <motion.div
            initial={reduced ? false : { y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <Eyebrow>{CONFIG.copy.faq.eyebrow}</Eyebrow>
            <h2 className="mt-8 font-heading font-thin not-italic leading-[1.05] tracking-[-0.02em] text-[clamp(2.5rem,4vw,3.8rem)] text-[#261f15] md:mt-10">
              {CONFIG.copy.faq.title}
            </h2>
            <div aria-hidden="true" className="mt-6 h-px w-10 bg-[#a3843f]" />
          </motion.div>

          <div className="mt-16 md:mt-24 mx-auto max-w-[1000px]">
            <div className="flex flex-col">
              {CONFIG.copy.faq.items.map((item, i) => {
                const open = openFaq === i;
                const num = String(i + 1).padStart(2, "0");
                return (
                  <motion.div
                    key={item.q}
                    initial={reduced ? false : { y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-5%" }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group relative border-b border-[#261f15]/20 last:border-b-0"
                  >
                    {/* Soft Gold Glow behind open item */}
                    <div
                      className={`absolute inset-0 z-0 bg-gradient-to-r from-transparent via-[#a3843f]/[0.08] to-transparent transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "opacity-100" : "opacity-0"}`}
                    />

                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`lec-faq-${i}`}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="relative z-10 flex w-full cursor-pointer items-start justify-between gap-4 py-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a3843f] sm:gap-8 sm:py-10"
                    >
                      {/* Oversized Ghost Numeral */}
                      <span className="absolute left-0 top-6 -z-10 font-heading not-italic text-[5rem] tabular-nums leading-none tracking-tighter text-[#261f15]/[0.04] transition-colors duration-500 sm:text-[6.5rem]">
                        {num}
                      </span>

                      <div className="flex flex-1 items-baseline gap-4 sm:gap-6 pt-2">
                        {/* Smaller visible numeral */}
                        <span className="pt-1 font-sans text-[0.68rem] font-semibold uppercase tabular-nums tracking-[0.2em] text-[#8a6f3d] shrink-0">
                          No. {num}
                        </span>

                        {/* Giant Thin-Serif Question */}
                        <span className="font-heading not-italic text-2xl leading-[1.15] tracking-tight text-[#261f15] transition-colors duration-300 group-hover:text-[#8a6f3d] sm:text-4xl">
                          {item.q}
                        </span>

                        {/* Dotted Leader */}
                        <span className="hidden flex-1 translate-y-[-0.6em] border-b-[1.5px] border-dotted border-[#261f15]/20 sm:block" />
                      </div>

                      {/* Rotating Gold Stamp */}
                      <div className="relative mt-2 flex h-8 w-8 shrink-0 items-center justify-center sm:h-10 sm:w-10">
                        <span
                          aria-hidden="true"
                          className={`absolute text-xl text-[#8a6f3d] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-2xl ${
                            open
                              ? "rotate-[135deg] scale-110"
                              : "rotate-0 scale-100"
                          }`}
                        >
                          ✦
                        </span>
                        <div
                          className={`absolute inset-0 rounded-full border border-[#8a6f3d]/30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            open
                              ? "scale-125 opacity-0"
                              : "scale-100 opacity-100"
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className="lec-reveal relative z-10"
                      data-open={open}
                      id={`lec-faq-${i}`}
                      aria-hidden={!open}
                    >
                      <div className="lec-reveal-inner">
                        <div className="pb-10 pl-[3.5rem] pr-6 sm:pl-[6.5rem] sm:pr-20">
                          <p className="font-sans text-sm leading-loose text-[#261f15]/80 sm:text-base">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-24 lg:hidden" />
      {quoteModal}
      {mobileBar}
    </main>
  );
}

/* ============================ STYLES ================================== */

function PageStyles() {
  return (
    <style>{`
      /* ---- worksheet range slider — a thin rule with an ink dot ---- */
      .lec-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 36px;
        background: transparent;
        cursor: pointer;
      }
      .lec-range::-webkit-slider-runnable-track {
        height: 2px;
        background: linear-gradient(
          to right,
          #a3843f 0%,
          #a3843f var(--lec-fill, 50%),
          rgba(38, 31, 21, 0.2) var(--lec-fill, 50%),
          rgba(38, 31, 21, 0.2) 100%
        );
      }
      .lec-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        margin-top: -6.5px;
        height: 15px;
        width: 15px;
        border-radius: 9999px;
        background: #261f15;
        border: none;
      }
      .lec-range::-moz-range-track {
        height: 2px;
        background: rgba(38, 31, 21, 0.2);
      }
      .lec-range::-moz-range-progress {
        height: 2px;
        background: #a3843f;
      }
      .lec-range::-moz-range-thumb {
        height: 15px;
        width: 15px;
        border-radius: 9999px;
        background: #261f15;
        border: none;
      }
      .lec-range:focus-visible {
        outline: none;
      }
      .lec-range:focus-visible::-webkit-slider-thumb {
        outline: 2px solid #a3843f;
        outline-offset: 3px;
      }
      .lec-range:focus-visible::-moz-range-thumb {
        outline: 2px solid #a3843f;
        outline-offset: 3px;
      }

      /* ---- stepper buttons — bordered print squares, 44px targets ---- */
      .lec-step {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: transparent;
        border: 1px solid rgba(38, 31, 21, 0.3);
        border-radius: 0;
        color: rgba(38, 31, 21, 0.7);
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s;
      }
      .lec-step:hover {
        border-color: #a3843f;
        color: #261f15;
      }
      .lec-step:focus-visible {
        outline: 2px solid #a3843f;
        outline-offset: 2px;
      }

      /* ---- print devices: stamps, the EST. RATE mark, ticket notches ---- */
      @keyframes lec-stamp-in {
        0% {
          transform: scale(1.3) rotate(-2deg);
          opacity: 0;
        }
        55% {
          transform: scale(0.95) rotate(-2deg);
          opacity: 1;
        }
        100% {
          transform: scale(1) rotate(-2deg);
        }
      }
      @keyframes lec-spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .lec-spin-slow {
        animation: lec-spin-slow 32s linear infinite;
      }
      .lec-stamped {
        display: inline-block;
        padding: 0.35rem 0.75rem;
        border: 1.5px solid #8a6f3d;
        color: #8a6f3d;
        transform: rotate(-2deg);
        animation: lec-stamp-in 0.28s cubic-bezier(0.2, 0.9, 0.3, 1);
      }
      .lec-stampmark {
        display: inline-block;
        color: #8a6f3d;
        animation: lec-stamp-in 0.24s cubic-bezier(0.2, 0.9, 0.3, 1);
      }
      .lec-estrate {
        position: absolute;
        right: 0;
        top: 1.6rem;
        padding: 0.3rem 0.6rem;
        border: 1.5px solid rgba(138, 111, 61, 0.8);
        color: #8a6f3d;
        font-size: 0.55rem;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        transform: rotate(-5deg);
        opacity: 0.9;
        pointer-events: none;
      }
      .lec-notch {
        position: absolute;
        left: -5.5px;
        width: 11px;
        height: 11px;
        border-radius: 9999px;
        background: #ededd5;
      }
      .lec-notch-top {
        top: -5.5px;
      }
      .lec-notch-bottom {
        bottom: -5.5px;
      }

      /* ---- quote-modal scrollbar — thin, rounded, brand gold ---- */
      .lec-modal-scroll {
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: #a3843f rgba(38, 31, 21, 0.07);
      }
      .lec-modal-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .lec-modal-scroll::-webkit-scrollbar-track {
        background: rgba(38, 31, 21, 0.07);
        border-radius: 9999px;
      }
      .lec-modal-scroll::-webkit-scrollbar-thumb {
        background: #a3843f;
        border-radius: 9999px;
      }
      .lec-modal-scroll::-webkit-scrollbar-thumb:hover {
        background: #8a6f3d;
      }

      /* ---- reveal panels (add-ons, embed, FAQ, mobile ledger) ---- */
      .lec-reveal {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .lec-reveal[data-open="true"] {
        grid-template-rows: 1fr;
      }
      .lec-reveal-inner {
        overflow: hidden;
      }

      @media (prefers-reduced-motion: reduce) {
        .lec-step,
        .lec-reveal {
          transition: none;
        }
        .lec-stamped,
        .lec-stampmark,
        .lec-spin-slow {
          animation: none;
        }
      }

      /* ---- print — the quote document IS the page ---- */
      @media print {
        html,
        body {
          height: auto !important;
          overflow: visible !important;
          background: #fff !important;
        }
        body * {
          visibility: hidden;
        }
        #lec-quote-doc,
        #lec-quote-doc * {
          visibility: visible;
        }
        /* unclip every ancestor of the document — the modal is a
           fixed, height-capped scroll region that would otherwise
           crop the printout to one viewport */
        .lec-modal-layer,
        .lec-modal-scroll,
        [role="dialog"] {
          position: static !important;
          display: block !important;
          overflow: visible !important;
          max-height: none !important;
          height: auto !important;
        }
        .lec-modal-scroll {
          padding: 0 !important;
          margin: 0 !important;
        }
        #lec-quote-doc {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          border: none !important;
          background: #fff !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .lec-quote-actions {
          display: none !important;
        }
      }
      @page {
        margin: 14mm;
      }
    `}</style>
  );
}
