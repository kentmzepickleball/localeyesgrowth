import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/general/Header";
import Footer from "@/components/sections/Footer";
import { CalendlyProvider } from "@/components/sections/CalendlyModal";
import { GrowthDiagnosticProvider } from "@/components/growth-diagnostic/GrowthDiagnosticProvider";
import BackToTop from "@/components/sections/BackToTop";
import { MetaPixelRouteTracker } from "@/components/analytics/MetaPixelRouteTracker";

const GA_MEASUREMENT_ID = "G-NRVFYH9E7D";
const CLARITY_PROJECT_ID = "wgpmuxn0sl";
const META_PIXEL_ID = "317714534152790";

const display = localFont({
  src: "./(fonts)/ivy-presto-headline-thin.otf",
  variable: "--font-display",
  display: "swap",
  style: "normal",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const OG_IMAGE = {
  url: "/og-image.webp",
  width: 512,
  height: 512,
  alt: "LocalEyes",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.localeyesgrowth.com"),
  title: "Catering SEO Services That Rank Caterers #1 | LocalEyes",
  description:
    'LocalEyes is the local SEO agency for coffee carts, beverage carts, and mobile event businesses. Rank at the top for catering "near me" and fill your booking calendar.',
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "LocalEyes Growth Agency",
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="min-h-full antialiased flex flex-col bg-cream text-espresso">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            alt=""
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <MetaPixelRouteTracker />
        <CalendlyProvider>
          <GrowthDiagnosticProvider>
            <Header />
            {children}
            <Footer />
            <BackToTop />
          </GrowthDiagnosticProvider>
        </CalendlyProvider>
      </body>
    </html>
  );
}
