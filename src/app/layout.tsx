import type { Metadata } from "next";
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
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
