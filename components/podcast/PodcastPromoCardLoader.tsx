"use client";

import dynamic from "next/dynamic";

/* next/dynamic's `ssr: false` is only legal inside a Client Component —
   app/page.tsx is a Server Component (async function, no "use client"),
   so the ssr:false call has to live in its own client-boundary wrapper
   like this one rather than inline in page.tsx. See PodcastPromoCard.tsx
   for why ssr:false is worth it here (no SEO value in this widget, and
   it keeps its thumbnail out of the server-rendered HTML entirely). */
const PodcastPromoCard = dynamic(
  () => import("./PodcastPromoCard").then((m) => m.PodcastPromoCard),
  { ssr: false },
);

export default PodcastPromoCard;
