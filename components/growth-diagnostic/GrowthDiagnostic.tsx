"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { DOMAINS } from "./data";
import { bandOf, computeResults, type Answers } from "./scoring";
import { submitLead, type Intake } from "./webhook";
import {
  calendlyUrlWithPrefill,
  loadCalendlyAssets,
  mountInlineCalendly,
  openBookingFallback,
  openCalendlyPopup,
} from "./calendly";
import { downloadReport } from "./scorecard";
import Radar from "./Radar";

/* ----------------------------------------------------------------------
   GROWTH DIAGNOSTIC — the quiz flow. Logic, wording, order, points,
   weights, scoring, webhook payload, Calendly behaviour and the
   scorecard are 1:1 with the original embed. The reskin presents ONE
   question per page ("07 / 48") with page-turn transitions; answer keys
   stay "<domainId>_<questionIndex>", so scoring input and the webhook
   payload are byte-identical.
   Flow: intro (-1) -> intake (0) -> questions (1..48) -> email gate
   (49) -> results (50).
   React-specific behaviours kept from the original port:
   - progress persists to sessionStorage, so an accidental close resumes
   - the score dial counts up and confetti fires once on completion
     (both disabled under prefers-reduced-motion; confetti lazy-loads)
   - options are real radio inputs, so the whole quiz is keyboardable
   ---------------------------------------------------------------------- */

export const STORAGE_KEY = "le-growth-diagnostic-v2";

const QUESTIONS = DOMAINS.flatMap((d) =>
  d.qs.map((q, qi) => ({ key: d.id + "_" + qi, domain: d, q })),
);
const QCOUNT = QUESTIONS.length; /* 48 */
const GATE_STEP = QCOUNT + 1;
export const RESULTS_STEP = QCOUNT + 2;

const pad2 = (n: number) => (n < 10 ? "0" + n : String(n));

const EMPTY_INTAKE: Intake = {
  name: "",
  business: "",
  vertical: "",
  city: "",
  website: "",
  years: "",
  volume: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Saved {
  step: number;
  intake: Intake;
  answers: Answers;
  email: string;
}

function answersComplete(a: Answers): boolean {
  return DOMAINS.every((d) =>
    d.qs.every((_q, qi) => typeof a[d.id + "_" + qi] === "number"),
  );
}

function loadSaved(): Saved {
  const fallback: Saved = {
    step: -1,
    intake: { ...EMPTY_INTAKE },
    answers: {},
    email: "",
  };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Saved>;
    if (typeof p.step !== "number" || p.step < -1 || p.step > RESULTS_STEP) {
      return fallback;
    }
    const answers: Answers = {};
    if (p.answers && typeof p.answers === "object") {
      for (const [k, v] of Object.entries(p.answers)) {
        if (typeof v === "number") answers[k] = v;
      }
    }
    let step = Math.round(p.step);
    /* never resume onto a screen the saved answers cannot support */
    if (step > QCOUNT && !answersComplete(answers)) {
      const qi = QUESTIONS.findIndex(
        (it) => typeof answers[it.key] !== "number",
      );
      step = qi >= 0 ? qi + 1 : GATE_STEP;
    }
    const intake = { ...EMPTY_INTAKE };
    if (p.intake && typeof p.intake === "object") {
      (Object.keys(EMPTY_INTAKE) as (keyof Intake)[]).forEach((k) => {
        const v = (p.intake as unknown as Record<string, unknown>)[k];
        if (typeof v === "string") intake[k] = v;
      });
    }
    return {
      step,
      intake,
      answers,
      email: typeof p.email === "string" ? p.email : "",
    };
  } catch {
    return fallback;
  }
}

export function clearSavedState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function GrowthDiagnostic({
  scrollContainerRef,
  onStepChange,
}: {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onStepChange?: (step: number) => void;
}) {
  const [saved] = useState(loadSaved);
  const [step, setStep] = useState(saved.step);
  const [intake, setIntake] = useState<Intake>(saved.intake);
  const [answers, setAnswers] = useState<Answers>(saved.answers);
  const [email, setEmail] = useState(saved.email);
  const [showErr, setShowErr] = useState(false);
  const [calFallback, setCalFallback] = useState(false);
  const [display, setDisplay] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const celebrateRef = useRef(false);
  const radarRef = useRef<SVGSVGElement>(null);
  const calWrapRef = useRef<HTMLDivElement>(null);
  const calInlineRef = useRef<HTMLDivElement>(null);
  const phaseTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(motion.matches);
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  /* resume: every state change lands in sessionStorage */
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, intake, answers, email }),
      );
    } catch {
      /* private mode etc. — quiz still works, just no resume */
    }
  }, [step, intake, answers, email]);

  useEffect(() => {
    setShowErr(false);
    onStepChange?.(step);
  }, [step, onStepChange]);

  /* ---- page turns: the outgoing page settles down and fades, the
          incoming one rises in (~250ms total; instant under reduced
          motion) ---- */
  const goTo = (next: number) => {
    window.clearTimeout(phaseTimer.current);
    const land = () => {
      setStep(next);
      try {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      } catch {
        /* ignore */
      }
    };
    if (reduced) {
      land();
      return;
    }
    setPhase("out");
    phaseTimer.current = window.setTimeout(() => {
      land();
      setPhase("in");
    }, 150);
  };
  useEffect(() => () => window.clearTimeout(phaseTimer.current), []);

  /* results are only computable once every question has an answer */
  const r = useMemo(
    () =>
      step === RESULTS_STEP && answersComplete(answers)
        ? computeResults(answers)
        : null,
    [step, answers],
  );

  /* ---- results: count-up dial (static under reduced motion) ---- */
  useEffect(() => {
    if (step !== RESULTS_STEP || !r) return;
    if (reduced) {
      setDisplay(r.overall);
      return;
    }
    let raf = 0;
    const target = r.overall;
    const dur = 1100;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, r, reduced]);

  /* ---- results: one confetti burst in the warm brand palette with the
          ✦ motif, lazy-loaded, skipped on resume and under reduced
          motion ---- */
  useEffect(() => {
    if (step !== RESULTS_STEP || !celebrateRef.current) return;
    celebrateRef.current = false;
    if (reduced) return;
    let cancelled = false;
    import("canvas-confetti")
      .then(({ default: confetti }) => {
        if (cancelled) return;
        let shapes;
        try {
          if (typeof confetti.shapeFromText === "function") {
            shapes = [confetti.shapeFromText({ text: "✦", scalar: 1.6 })];
          }
        } catch {
          /* default shapes are fine */
        }
        confetti({
          particleCount: 90,
          spread: 75,
          startVelocity: 38,
          origin: { y: 0.3 },
          zIndex: 260,
          colors: ["#c6a66a", "#a3843f", "#9c4a2f", "#f6f1e3"],
          ...(shapes ? { shapes, scalar: 1.6 } : {}),
        });
      })
      .catch(() => {
        /* celebration is optional; results still show */
      });
    return () => {
      cancelled = true;
    };
  }, [step, reduced]);

  /* ---- results: inline Calendly (assets lazy-load here, retries while
          the script arrives, falls back to a plain button) ---- */
  useEffect(() => {
    if (step !== RESULTS_STEP) {
      setCalFallback(false);
      return;
    }
    if (!answersComplete(answers)) return;
    loadCalendlyAssets();
    const el = calInlineRef.current;
    if (!el) return;
    const res = computeResults(answers);
    return mountInlineCalendly(
      el,
      calendlyUrlWithPrefill(res.overall, intake.name, intake.business, email),
      () => setCalFallback(true),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* ================= handlers ================= */

  const intakeNext = () => {
    const trimmed: Intake = {
      name: intake.name.trim(),
      business: intake.business.trim(),
      vertical: intake.vertical.trim(),
      city: intake.city.trim(),
      website: intake.website.trim(),
      years: intake.years.trim(),
      volume: intake.volume.trim(),
    };
    setIntake(trimmed);
    if (Object.values(trimmed).some((v) => !v)) {
      setShowErr(true);
      return;
    }
    goTo(1);
  };

  const selectAnswer = (key: string, oi: number) => {
    setAnswers((prev) => ({ ...prev, [key]: oi }));
  };

  const gateShow = () => {
    const em = email.trim();
    if (!EMAIL_RE.test(em)) {
      setShowErr(true);
      return;
    }
    setEmail(em);
    submitLead(intake, em, answers);
    celebrateRef.current = true;
    goTo(RESULTS_STEP);
  };

  const onBookTop = () => {
    const el = calWrapRef.current;
    if (el && el.scrollIntoView) {
      el.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    } else if (r) {
      openCalendlyPopup(
        calendlyUrlWithPrefill(r.overall, intake.name, intake.business, email),
      );
    }
  };

  /* ================= running header ================= */

  const counter =
    step === 0
      ? "Intake"
      : step >= 1 && step <= QCOUNT
        ? pad2(step) + " / " + QCOUNT
        : step === GATE_STEP
          ? "Final step"
          : "Scorecard";

  const pct =
    step <= 0
      ? step === 0
        ? 2
        : 0
      : step <= QCOUNT
        ? Math.round((step / QCOUNT) * 96) + 2
        : step === GATE_STEP
          ? 99
          : 100;

  /* ================= screens ================= */

  let screen: React.ReactNode = null;

  if (step === -1) {
    screen = (
      <div className="gd-cover">
        <p className="gd-kicker">
          <span className="star" aria-hidden="true">
            ✦
          </span>{" "}
          LocalEyes &middot; Built only for event caterers{" "}
          <span className="star" aria-hidden="true">
            ✦
          </span>
        </p>
        <h1>
          What's your <span className="tt">Mobile Catering Growth Score</span>?
        </h1>
        <p className="gd-lede">
          48 quick questions. About 7 minutes. A scored report on the 11 things
          that decide who gets found and booked.
        </p>
        <p className="gd-intro-p">
          <strong>
            Most mobile caterers do not lose to better coffee, cocktails, or
            boards. They lose to obscurity.
          </strong>{" "}
          In 7 minutes, know exactly what is costing you bookings, and what to
          fix first.
        </p>
        <div className="deal">
          <div className="deal-head">Here is everything you get, free:</div>
          <ul className="stack">
            <li>
              <strong>Your Growth Score</strong> across the 11 areas that decide
              who gets found and booked, with your two biggest leaks and the
              exact fix for each <span className="val">$79 value</span>
            </li>
            <li>
              <strong>A real audit by our team:</strong> your rankings, your
              Google profile, your website{" "}
              <span className="val">$350 value</span>
            </li>
            <li>
              <strong>A live results breakdown</strong> where we walk you
              through every finding, plus your 90-day plan{" "}
              <span className="val">$250 value</span>
            </li>
          </ul>
          <div className="price-line">
            Total value:<span className="strike">$679</span>
            <span className="free">FREE today</span>
          </div>
        </div>
        <button type="button" className="btn w100" onClick={() => goTo(0)}>
          Get my free Growth Score &rarr;
        </button>
        <p className="note" style={{ marginTop: 10, textAlign: "center" }}>
          7 minutes. No credit card. No obligation.
        </p>
      </div>
    );
  } else if (step === 0) {
    const field = (
      key: keyof Intake,
      label: string,
      input: React.ReactNode,
    ) => (
      <div className="fld" key={key}>
        <label htmlFor={"f_" + key}>{label}</label>
        {input}
      </div>
    );
    const text = (key: keyof Intake) => (
      <input
        type="text"
        id={"f_" + key}
        value={intake[key]}
        onChange={(e) => setIntake((p) => ({ ...p, [key]: e.target.value }))}
      />
    );
    const select = (key: keyof Intake, options: string[]) => (
      <select
        id={"f_" + key}
        value={intake[key]}
        onChange={(e) => setIntake((p) => ({ ...p, [key]: e.target.value }))}
      >
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
    screen = (
      <>
        <p className="gd-sub">
          First, the basics. These personalize your score and power your audit.
        </p>
        <h2 className="gd-h2">About your business</h2>
        {field("name", "First name", text("name"))}
        {field("business", "Business name", text("business"))}
        {field(
          "vertical",
          "What do you cater?",
          select("vertical", [
            "Coffee cart",
            "Mobile bar",
            "Charcuterie and grazing",
            "Dessert cart",
            "Other mobile catering",
          ]),
        )}
        {field("city", "Your home city or metro", text("city"))}
        {field(
          "website",
          'Website address (or "no website yet")',
          text("website"),
        )}
        {field(
          "years",
          "Years in business",
          select("years", ["Under 1", "1 to 2", "3 to 5", "6+"]),
        )}
        {field(
          "volume",
          "Events in a typical month right now",
          select("volume", ["0 to 3", "4 to 8", "9 to 20", "20+"]),
        )}
        <div className={"gd-err" + (showErr ? " show" : "")} role="alert">
          Please fill in every field so your score and audit are accurate.
        </div>
        <div className="gd-nav">
          <span></span>
          <button type="button" className="nav-btn" onClick={intakeNext}>
            Next &rarr;
          </button>
        </div>
      </>
    );
  } else if (step >= 1 && step <= QCOUNT) {
    const item = QUESTIONS[step - 1]!;
    const answered = typeof answers[item.key] === "number";
    screen = (
      <>
        <div className="gd-sec">
          <span className="star" aria-hidden="true">
            ✦
          </span>{" "}
          {item.domain.name}
        </div>
        <fieldset className="q">
          <legend className="gd-q">{item.q.t}</legend>
          {item.q.o.map((opt, oi) => (
            <label
              key={oi}
              className={"opt" + (answers[item.key] === oi ? " sel" : "")}
            >
              <input
                type="radio"
                name={item.key}
                checked={answers[item.key] === oi}
                onChange={() => selectAnswer(item.key, oi)}
              />
              <span className="mark" aria-hidden="true"></span>
              <span>{opt[0]}</span>
            </label>
          ))}
        </fieldset>
        <div className="gd-nav">
          <button
            type="button"
            className="nav-btn"
            onClick={() => goTo(step - 1)}
          >
            &larr; Back
          </button>
          <button
            type="button"
            className="nav-btn"
            disabled={!answered}
            onClick={() => goTo(step + 1)}
          >
            {step === QCOUNT ? "Almost done" : "Next"} &rarr;
          </button>
        </div>
      </>
    );
  } else if (step === GATE_STEP) {
    screen = (
      <>
        <p className="gd-sub">
          Last step: where do we send your score and your audit?
        </p>
        <h2 className="gd-h2">Your score is ready</h2>
        <p style={{ fontSize: 14, marginBottom: 18 }}>
          Enter your email and we will show your full scorecard now. Then we run
          the objective audit on our side (your rankings, your Google profile, a
          5-point website review) and walk you through everything live on your
          free breakdown. That is $679 of audit and strategy work, free.
        </p>
        <div className="fld">
          <label htmlFor="f_email">Email</label>
          <input
            type="email"
            id="f_email"
            placeholder="you@yourbusiness.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") gateShow();
            }}
          />
        </div>
        <div className={"gd-err" + (showErr ? " show" : "")} role="alert">
          That email does not look right. Mind checking it?
        </div>
        <div className="gd-nav">
          <button
            type="button"
            className="nav-btn"
            onClick={() => goTo(QCOUNT)}
          >
            &larr; Back
          </button>
          <button type="button" className="btn" onClick={gateShow}>
            Show my score
          </button>
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          We send the report, a short series of fixes matched to your weakest
          areas, and nothing else. Unsubscribe anytime.
        </p>
      </>
    );
  } else if (r) {
    const rows = r.domains
      .slice()
      .sort((a, b) => a.score - b.score)
      .map((d) => {
        const b = bandOf(d.score);
        return (
          <tr key={d.id}>
            <td>{d.name}</td>
            <td className="num">{d.score}</td>
            <td>
              <span className={"band " + b[1]}>{b[0]}</span>
            </td>
          </tr>
        );
      });
    screen = (
      <>
        <p className="gd-sub center">
          Your scorecard. Your full audit gets delivered live on your free
          breakdown.
        </p>
        <div className="score-hero">
          <div className="dial">
            {display}
            <small>/100</small>
          </div>
          <div>
            <div className="tier">{r.tier.name}</div>
            <p className="tier-copy">{r.tier.copy}</p>
          </div>
        </div>
        <div className="audit-offer">
          <p className="audit-offer-kicker">✦ Included with your score ✦</p>
          <h2 className="audit-offer-title">
            Free <span className="gold">SEO Audit</span>
          </h2>
          <p className="audit-offer-value">
            A<span className="strikeval">$679</span>value — yours free
          </p>
          <button type="button" className="btn w100" onClick={onBookTop}>
            Book my free breakdown &rarr;
          </button>
          <p className="note">
            20 minutes. We walk you through your full audit live. A $679 value,
            free.
          </p>
        </div>
        <h2 className="rh">Your 11 domains</h2>
        <Radar ref={radarRef} domains={r.domains} />
        <table className="gd-t">
          <tbody>
            <tr>
              <th>Domain</th>
              <th>Score</th>
              <th>Band</th>
            </tr>
            {rows}
          </tbody>
        </table>
        <div className="dl-wrap">
          <button
            type="button"
            className="nav-btn"
            onClick={() =>
              downloadReport(
                r,
                intake,
                radarRef.current ? radarRef.current.outerHTML : "",
              )
            }
          >
            Download my scorecard
          </button>
        </div>
        <h2 className="rh">Your two biggest opportunities</h2>
        {r.lowest.map((d, i) => (
          <div className="opp" key={d.id}>
            <h3>
              {pad2(i + 1)} &middot; {d.fix.h}{" "}
              <span className="opp-score">
                ({d.score}, {bandOf(d.score)[0]})
              </span>
            </h3>
            <p>
              <strong>What it means:</strong> {d.fix.d}
            </p>
            <p>
              <strong>The fix:</strong> {d.fix.f}
            </p>
            <p className="proof">Why it matters: {d.fix.p}</p>
          </div>
        ))}
        <div className="cta-box">
          <h3>Rankings get you found. The playbook gets you booked.</h3>
          <p>
            LocalEyes is not a generic SEO shop. We are a growth partner that
            works only with event caterers and knows this business from the cost
            stack up: pricing, packaging, reviews, follow-up, the seasonal
            calendar.
          </p>
          <p>
            Your audit is running now: your rankings, your Google Business
            Profile, a 5-point website review, plus your 90-day plan across all
            11 areas. That is $679 of audit and strategy work, yours free,
            delivered live on your breakdown. Recent clients went from 4 leads a
            month to 34 in two months, with top-three rankings in New York,
            Philadelphia, Orlando, Chicago, and LA.
          </p>
          <p className="note">
            Pick your time below. No prep needed, we bring the audit. &darr;
          </p>
        </div>
        <div ref={calWrapRef}>
          <h2 className="rh">Grab your breakdown slot</h2>
          <p className="note" style={{ marginBottom: 6 }}>
            20 minutes, live with our team. $679 of work, free. Slots go to
            whoever grabs them first.
          </p>
          {calFallback ? (
            <div style={{ textAlign: "center", padding: "14px 0" }}>
              <button
                type="button"
                className="btn"
                onClick={openBookingFallback}
              >
                Book my free breakdown &rarr;
              </button>
            </div>
          ) : (
            <div
              ref={calInlineRef}
              style={{
                minWidth: 320,
                height: 700,
                border: "1px solid rgba(38, 31, 21, 0.14)",
                overflow: "hidden",
                background: "#f6f1e3",
              }}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="gd">
      {step !== -1 && (
        <>
          <div className="gd-run">
            <div className="brand">
              LocalEyes{" "}
              <span className="star" aria-hidden="true">
                ✦
              </span>{" "}
              Growth Diagnostic
            </div>
            <div className="count">{counter}</div>
          </div>
          <div className="gd-rule" aria-hidden="true">
            <i style={{ width: pct + "%" }} />
          </div>
        </>
      )}
      <div className="gd-body">
        <div key={step} className={"gd-page " + phase}>
          {screen}
        </div>
      </div>
      <div className="gd-foot">
        localeyesgrowth.com &middot; @LOCALEYESSEO &middot; You pour. We get you
        found.
      </div>
    </div>
  );
}
