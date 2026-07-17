import { NextResponse } from "next/server";
import { computeResults, type Answers } from "@/components/growth-diagnostic/scoring";
import type { Intake } from "@/components/growth-diagnostic/webhook";

type SubmitPayload = {
  email: string;
  intake: Intake;
  answers: Answers;
  submittedAt?: string;
};

/* Receives Growth Diagnostic quiz submissions (this is the default target
   webhook.ts posts to). Computes the score server-side from the raw
   answers, then forwards everything to a Google Sheet via a Google Apps
   Script Web App URL — set SHEETS_WEBHOOK_URL in .env. This same webhook
   URL is shared with /api/quote (the coffee-cart quote form); the Apps
   Script tells the two apart via formType and routes each to its own tab.
   Without that env var, submissions are just logged to the server console
   so nothing is silently lost. */
export async function POST(request: Request) {
  let body: SubmitPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, intake, answers, submittedAt } = body ?? {};
  if (!email || !intake || !answers) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let results: ReturnType<typeof computeResults>;
  try {
    results = computeResults(answers);
  } catch (error) {
    console.error("Failed to score quiz answers:", error);
    return NextResponse.json({ error: "Incomplete answers." }, { status: 400 });
  }

  const record = {
    formType: "growth-diagnostic",
    submittedAt: submittedAt || new Date().toISOString(),
    email,
    name: intake.name,
    business: intake.business,
    vertical: intake.vertical,
    city: intake.city,
    website: intake.website,
    years: intake.years,
    volume: intake.volume,
    overallScore: results.overall,
    tier: results.tier.name,
    domainScores: results.domains.map((d) => ({ name: d.name, score: d.score })),
  };

  const sheetUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!sheetUrl) {
    console.warn(
      "SHEETS_WEBHOOK_URL is not set — lead not recorded in a sheet:",
      record,
    );
    return NextResponse.json({ ok: true, recorded: false });
  }

  try {
    const res = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      console.error("Sheet webhook responded with an error:", res.status);
      return NextResponse.json({ ok: true, recorded: false });
    }
  } catch (error) {
    console.error("Failed to forward lead to sheet webhook:", error);
    return NextResponse.json({ ok: true, recorded: false });
  }

  return NextResponse.json({ ok: true, recorded: true });
}
