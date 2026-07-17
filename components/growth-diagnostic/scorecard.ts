import { CONFIG } from "./config";
import { bandOf, type Results } from "./scoring";
import type { Intake } from "./webhook";

/* ----------------------------------------------------------------------
   DOWNLOADABLE SCORECARD — ported 1:1 from the original embed.
   Opens a print-ready copy of the results (score, tier, radar, table,
   top two opportunities, CTA) in a new tab with a Print / Save-as-PDF
   button. If the popup is blocked, it downloads as an HTML file instead.
   Fully client-side, no libraries.
   ---------------------------------------------------------------------- */

function esc(s: unknown): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadReport(
  r: Results,
  intake: Intake,
  radarOuterHTML: string,
) {
  const radar = radarOuterHTML || "";
  const rows = r.domains
    .slice()
    .sort((a, b) => a.score - b.score)
    .map((d) => {
      const b = bandOf(d.score);
      return (
        "<tr><td>" +
        esc(d.name) +
        '</td><td class="num">' +
        d.score +
        '</td><td><span class="band ' +
        b[1] +
        '">' +
        b[0] +
        "</span></td></tr>"
      );
    })
    .join("");
  const opps = r.lowest
    .map((d, i) => {
      return (
        '<div class="opp"><h3>' +
        (i + 1) +
        ". " +
        esc(d.fix.h) +
        " (" +
        d.score +
        ", " +
        bandOf(d.score)[0] +
        ")</h3>" +
        "<p><strong>What it means:</strong> " +
        esc(d.fix.d) +
        "</p><p><strong>The fix:</strong> " +
        esc(d.fix.f) +
        "</p>" +
        '<p class="proof">Why it matters: ' +
        esc(d.fix.p) +
        "</p></div>"
      );
    })
    .join("");
  const who = esc(intake.business || intake.name || "Your business");
  const doc =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mobile Catering Growth Score: ' +
    who +
    "</title><style>" +
    "body{font-family:Arial,Helvetica,sans-serif;color:#20211d;background:#f4efe6;margin:0;padding:0;line-height:1.55;}" +
    ".page{max-width:760px;margin:0 auto;background:#fbf8f2;padding:0 0 30px;}" +
    "header{background:#1f4e5f;color:#f4efe6;padding:30px 36px;}" +
    "header .b{font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.85;}" +
    "header h1{font-family:Georgia,serif;font-weight:400;font-size:26px;margin:10px 0 6px;}" +
    "header .m{font-size:13px;opacity:.9;}" +
    "section{padding:24px 36px 0;}" +
    ".dial{font-family:Georgia,serif;font-size:64px;color:#1f4e5f;line-height:1;display:inline-block;}" +
    ".dial small{font-size:20px;color:#8a8272;}" +
    ".tier{font-family:Georgia,serif;font-size:18px;font-style:italic;color:#c8862a;}" +
    "h2{font-family:Georgia,serif;font-weight:400;font-size:19px;color:#1f4e5f;margin:18px 0 8px;}" +
    "table{width:100%;border-collapse:collapse;font-size:13px;}" +
    "th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8a8272;padding:6px 8px;border-bottom:2px solid #20211d;}" +
    "td{padding:7px 8px;border-bottom:1px solid #e5ddcd;}" +
    ".num{font-family:Georgia,serif;font-size:15px;}" +
    ".band{display:inline-block;padding:1px 9px;border-radius:2px;color:#fff;font-size:10.5px;}" +
    ".b-red{background:#a63d2f;}.b-amber{background:#c8862a;}.b-green{background:#3d6b4f;}" +
    ".opp{background:#f1e9d8;padding:14px 16px;margin-top:12px;border-left:4px solid #c8862a;}" +
    ".opp h3{font-family:Georgia,serif;font-size:15px;color:#1f4e5f;margin:0 0 6px;}" +
    ".opp p{font-size:13px;margin:0 0 6px;}" +
    ".proof{font-size:11.5px;color:#6d6656;font-style:italic;}" +
    ".cta{background:#1f4e5f;color:#f4efe6;text-align:center;padding:20px 24px;margin:22px 36px 0;}" +
    ".cta a{display:inline-block;background:#c8862a;color:#fff;padding:11px 26px;text-decoration:none;font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin-top:8px;}" +
    ".printbtn{position:fixed;top:14px;right:14px;background:#c8862a;color:#fff;border:0;padding:10px 18px;font-size:13px;cursor:pointer;border-radius:3px;}" +
    "svg{display:block;margin:8px auto;}" +
    "footer{text-align:center;font-size:11px;color:#8a8272;padding:16px 36px 0;}" +
    "@media print{.printbtn{display:none;}body{background:#fff;}}" +
    "</style></head><body>" +
    '<button class="printbtn" onclick="window.print()">Print / Save as PDF</button>' +
    '<div class="page"><header><div class="b">LocalEyes &middot; Built only for event caterers</div>' +
    '<h1>Mobile Catering Growth Score</h1><div class="m">' +
    who +
    " &middot; " +
    new Date().toLocaleDateString() +
    "</div></header>" +
    '<section><span class="dial">' +
    r.overall +
    "<small>/100</small></span> &nbsp; " +
    '<span class="tier">' +
    esc(r.tier.name) +
    "</span>" +
    '<p style="font-size:13.5px;">' +
    esc(r.tier.copy) +
    "</p>" +
    radar +
    "<h2>Your 11 domains</h2><table><tr><th>Domain</th><th>Score</th><th>Band</th></tr>" +
    rows +
    "</table>" +
    "<h2>Your two biggest opportunities</h2>" +
    opps +
    "</section>" +
    '<div class="cta"><div style="font-family:Georgia,serif;font-size:17px;">Your free breakdown is waiting</div>' +
    '<div style="font-size:12.5px;margin-top:4px;">We walk you through your full audit live: rankings, Google profile, website, and your 90-day plan. $679 of audit and strategy work, yours free.</div>' +
    '<a href="' +
    esc(CONFIG.calendlyUrl) +
    '?utm_source=growth_diagnostic_download">Book my free breakdown</a></div>' +
    "<footer>localeyesgrowth.com &middot; @LOCALEYESSEO &middot; You pour. We get you found.</footer></div>" +
    "</body></html>";
  try {
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = url;
      a.download = "mobile-catering-growth-score.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } catch {
    /* ignore */
  }
}
