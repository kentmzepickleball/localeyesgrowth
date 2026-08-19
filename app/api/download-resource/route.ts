import { NextResponse } from "next/server";
import { Resend } from "resend";

/* Gates a blog post's downloadable resource (e.g. the Review Playbook)
   behind an email capture. Two effects on submit, same pattern as
   /api/quote and /api/submit-lead:
   1. Send the downloader a confirmation email with the direct link
      (Resend — RESEND_API_KEY).
   2. Log the lead to a Google Sheet (SHEETS_WEBHOOK_URL), tab-routed
      via formType.
   Both are best-effort: a missing env var or a failed send is logged
   and does not block the response, since the file also downloads
   directly in the browser regardless (see ResourceCard in
   components/BlogArticle.tsx) — this endpoint's job is the lead
   capture, not gating the actual file access. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = "https://www.localeyesgrowth.com";

export async function POST(request: Request) {
  let body: { email?: string; resourceLabel?: string; resourceUrl?: string; postSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const resourceLabel = body.resourceLabel ?? "your download";
  const resourceUrl = body.resourceUrl ?? "";
  const absoluteUrl = resourceUrl ? `${SITE_URL}${resourceUrl}` : "";

  let emailSent = false;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — download confirmation email not sent.");
  } else if (absoluteUrl) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: "LocalEyes Growth <hello@localeyesgrowth.com>",
        to: email,
        replyTo: "hello@localeyesgrowth.com",
        subject: `Your download: ${resourceLabel}`,
        text: [
          `Hi,`,
          ``,
          `Here's your copy of ${resourceLabel}:`,
          absoluteUrl,
          ``,
          `— LocalEyes`,
        ].join("\n"),
      });
      if (error) {
        console.error("Resend send failed:", error);
      } else {
        emailSent = true;
      }
    } catch (error) {
      console.error("Resend send failed:", error);
    }
  }

  const record = {
    formType: "resource-download",
    submittedAt: new Date().toISOString(),
    email,
    resourceLabel,
    resourceUrl,
    postSlug: body.postSlug ?? "",
  };

  let recorded = false;
  const sheetUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!sheetUrl) {
    console.warn("SHEETS_WEBHOOK_URL is not set — download not recorded in a sheet:", record);
  } else {
    try {
      const res = await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      recorded = res.ok;
      if (!res.ok) console.error("Sheet webhook responded with an error:", res.status);
    } catch (error) {
      console.error("Failed to forward download lead to sheet webhook:", error);
    }
  }

  return NextResponse.json({ ok: true, emailSent, recorded });
}
