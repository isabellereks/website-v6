import type { Metadata } from "next";
import BannerMock from "./BannerMock";

export const metadata: Metadata = {
  title: "Washington college abortion-resource banner — working mock",
  description:
    "A working mock of a DOH-led abortion-resource banner for Washington public colleges.",
  alternates: { canonical: "/wa-resource-banner" },
  robots: { index: false, follow: false },
};

// The shareable `?host=` preview is request-specific, so this route may block on navigation.
export const instant = false;

interface WashingtonResourceBannerPageProps {
  searchParams: Promise<{ host?: string | string[] }>;
}

export default async function WashingtonResourceBannerPage({
  searchParams,
}: WashingtonResourceBannerPageProps) {
  const { host } = await searchParams;
  const initialHost = Array.isArray(host) ? host[0] : host;

  return <BannerMock initialHost={initialHost} />;
}
