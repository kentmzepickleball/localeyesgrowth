"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* The base pixel (app/layout.tsx) fires the first PageView on load, but
   this is a client-side-routed app — Link/router.push navigations never
   hit the server again, so without this every route after the first one
   would go untracked. Fires a PageView on every pathname change. */
export function MetaPixelRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
