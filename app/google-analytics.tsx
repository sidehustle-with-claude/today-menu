import Script from "next/script";
import { gaEnabled, gaId } from "../src/analytics";

// 운영(production)에서 측정 ID 가 있을 때만 구글 태그를 붙인다. localhost 개발에서는 아무것도 붙지 않는다.
// 태그는 이 한 곳에서만 붙인다(두 번 붙이면 이벤트가 중복된다).
export default function GoogleAnalytics() {
  if (!gaEnabled()) return null;
  const id = gaId();
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
