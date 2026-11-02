import Script from "next/script";
import { adsenseEnabled, adsensePub } from "../src/adsense";

// 광고 코드는 이 한 곳에서만 붙인다. 운영에서 게시자 ID 가 있을 때만 나온다.
export function AdSenseScript() {
  if (!adsenseEnabled()) return null;
  return (
    <Script
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsensePub()}`}
      crossOrigin="anonymous"
    />
  );
}

// 추천 카드 아래 한 곳. 높이를 미리 잡아 두어 카드가 밀리지 않게 한다.
// data-ad-slot 값은 애드센스에서 광고 단위를 만든 뒤 NEXT_PUBLIC_ADSENSE_SLOT 에 넣는다.
export default function AdSlot() {
  if (!adsenseEnabled()) return null;
  const slot = (process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "").trim();
  if (!/^\d{6,}$/.test(slot)) return null;
  return (
    <aside className="ad-slot" aria-label="광고">
      <ins className="adsbygoogle" style={{ display: "block", minHeight: 100 }} data-ad-client={`ca-${adsensePub()}`} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      <Script id="adsense-push" strategy="afterInteractive">{`(window.adsbygoogle = window.adsbygoogle || []).push({});`}</Script>
    </aside>
  );
}
