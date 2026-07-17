import type { Metadata } from "next";
import localFont from "next/font/local";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/general/Header";
import Footer from "@/components/sections/Footer";
import { CalendlyProvider } from "@/components/sections/CalendlyModal";
import BackToTop from "@/components/sections/BackToTop";

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
  /* TEMP — the brand logo as a placeholder OG image, swap for a real
     1200x630 social preview image when ready. */
  url: "/logo-cup.webp",
  width: 512,
  height: 512,
  alt: "LocalEyes",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.localeyesgrowth.com"),
  title: "Home | LocalEyes Growth Agency",
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
