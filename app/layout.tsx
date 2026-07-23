import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/general/Header";
import Footer from "@/components/sections/Footer";
import { CalendlyProvider } from "@/components/sections/CalendlyModal";
import BackToTop from "@/components/sections/BackToTop";

const GA_MEASUREMENT_ID = "G-NRVFYH9E7D";

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
      </head>
      <body className="min-h-full antialiased flex flex-col bg-cream text-espresso">
        <CalendlyProvider>
          <Header />
          {children}
          <Footer />
          <BackToTop />
        </CalendlyProvider>
      </body>
    </html>
  );
}
