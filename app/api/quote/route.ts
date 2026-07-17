import { NextResponse } from "next/server";
import { Resend } from "resend";

type LeadPayload = {
  lead: {
    name: string;
    email: string;
    business: string;
    phone?: string;
    client?: string;
    date?: string;
  };
  summary: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { lead, summary } = body ?? {};
  if (!lead?.email || !lead?.name?.trim() || !lead?.business?.trim() || !summary) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(lead.email.trim())) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const text = [
    `Hi ${lead.name.trim()},`,
    ``,
    `Here's your client-ready quote from the LocalEyes Coffee Catering Price Calculator.`,
    ``,
    summary,
    ``,
    `Business: ${lead.business.trim()}`,
    lead.client?.trim() ? `Client / event: ${lead.client.trim()}` : null,
    lead.date?.trim() ? `Event date: ${lead.date.trim()}` : null,
    lead.phone?.trim() ? `Phone: ${lead.phone.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "LocalEyes Growth <quotes@localeyesgrowth.com>",
      to: lead.email.trim(),
      replyTo: "hello@localeyesgrowth.com",
      subject: "Your coffee catering quote — LocalEyes",
      text,
    });

    if (error) {
      console.error("Resend send failed:", error);
      return NextResponse.json({ error: "Failed to send email." }, { status: 502 });
    }
  } catch (error) {
    console.error("Resend send failed:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 502 });
  }

  /* Best-effort — log this quote request to Google Sheets too (separate
     tab from the growth diagnostic quiz). Never fails the request just
     because the sheet forward failed; the email already sent. */
  const sheetUrl = process.env.SHEETS_WEBHOOK_URL;
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "quote",
          submittedAt: new Date().toISOString(),
          name: lead.name.trim(),
          email: lead.email.trim(),
          business: lead.business.trim(),
          phone: lead.phone?.trim() || "",
          client: lead.client?.trim() || "",
          date: lead.date?.trim() || "",
          summary,
        }),
      });
    } catch (error) {
      console.error("Failed to forward quote request to sheet webhook:", error);
    }
  } else {
    console.warn("SHEETS_WEBHOOK_URL is not set — quote request not recorded in a sheet.");
  }

  return NextResponse.json({ ok: true });
}
