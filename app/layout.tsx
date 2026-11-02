import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "./google-analytics";
import { clampTitle, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../src/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: clampTitle(`${SITE_NAME}: 동네 맛집 추천`),
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
