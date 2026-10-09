import type { Metadata } from "next";
import Script from "next/script";
import { Inter_Tight, Instrument_Serif, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const signature = Mrs_Saint_Delafield({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://isabellereks.com"),
  title: "Isabelle Reksopuro",
  description: "Isabelle Reksopuro works where technology meets public policy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} ${instrumentSerif.variable} ${signature.variable}`}>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-grab@0.2.0/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
