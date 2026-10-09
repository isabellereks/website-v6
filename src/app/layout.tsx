import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

// Open Runde (from v4): a rounded Inter, SIL Open Font License.
const openRunde = localFont({
  src: [
    { path: "./fonts/OpenRunde-Regular.woff2", weight: "400" },
    { path: "./fonts/OpenRunde-Medium.woff2", weight: "500" },
    { path: "./fonts/OpenRunde-SemiBold.woff2", weight: "600" },
    { path: "./fonts/OpenRunde-Bold.woff2", weight: "700" },
  ],
  variable: "--font-open-runde",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://isabellereks.com"),
  title: "Isabelle Reksopuro",
  description: "Isabelle Reksopuro works where technology meets public policy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${openRunde.variable} ${interTight.variable}`}>
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
