import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "./site-footer";
import { listPosts } from "../src/content";
import { absoluteUrl, SITE_NAME } from "../src/site";

export const metadata: Metadata = {
  title: "오늘 뭐 먹지: 동네를 고르면 오늘 먹을 곳 3곳을 골라 줘요",
  description: "동네와 메뉴를 고르면 날씨와 취향에 맞는 가게 3곳을 보여 주는 서비스입니다. 설치 없이 웹에서 바로 쓸 수 있어요.",
  alternates: { canonical: "/" },
};

const FEATURES = [
  { title: "동네와 메뉴로 3곳 추천", text: "동네 이름을 넣고 한식, 분식, 카페, 중식 중 하나를 고르면 오늘 갈 만한 곳 3곳을 보여 줍니다." },
  { title: "한 줄 취향 반영", text: "\"매운 거 말고, 혼밥\"처럼 한 줄로 적으면 조건으로 바꾸어 추천에 반영합니다." },
  { title: "즐겨찾기와 영어 화면", text: "마음에 든 가게에 별을 달아 두고, 화면 언어를 한국어와 영어로 바꿀 수 있습니다." },
];

const SHOTS = [
  { src: "/images/today-menu-recommend-cards.png", alt: "동네 이름을 넣고 추천 받기를 누르면 가게 카드 3개가 나온 화면" },
  { src: "/images/today-menu-taste-input.png", alt: "한 줄 취향을 적고 반영을 누른 뒤 분식 가게가 먼저 나온 화면" },
  { src: "/images/today-menu-place-detail.png", alt: "가게 이름과 동네, 영업시간이 보이는 가게 상세 화면" },
];

const FAQ = [
  { q: "개인정보를 받나요?", a: "기기의 현재 위치는 받지 않습니다. 이메일로 로그인한 경우에만 이메일을 서버에 저장합니다. 자세한 내용은 개인정보처리방침에 있습니다." },
  { q: "돈이 드나요?", a: "무료입니다. 이 예제에는 결제 기능이 없습니다." },
  { q: "어느 지역을 지원하나요?", a: "이 예제 서비스는 가상 데이터로 만든 몇 개 동네만 담고 있습니다." },
];

// 구조화 데이터: 평점과 리뷰는 실제 데이터가 없으므로 넣지 않는다. 가짜 숫자를 만들지 않는다.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["MobileApplication", "SoftwareApplication"],
  name: SITE_NAME,
  url: absoluteUrl("/"),
  operatingSystem: "iOS, Android",
  applicationCategory: "LifestyleApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

export default function Landing() {
  const updates = listPosts("updates");
  const guides = listPosts("guides");
  return (
    <main className="wide landing">
      <header>
        <h1>오늘 뭐 먹지: 동네를 고르면 오늘 먹을 곳 3곳</h1>
        <p className="lead">동네와 메뉴를 고르면 날씨와 취향에 맞는 가게 3곳을 골라 드려요.</p>
        <div className="store-buttons">
          {/* TODO: 앱이 스토어에 등록되면 실제 주소로 바꾼다 (39장). 지금은 자리표시자다. */}
          <a href="#" aria-disabled="true">App Store에서 받기 (준비 중)</a>
          <a href="#" aria-disabled="true">Google Play에서 받기 (준비 중)</a>
          <Link href="/menu" className="primary">웹에서 바로 쓰기</Link>
        </div>
      </header>

      <section aria-label="기능">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <h2>{f.title}</h2>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="shots" aria-label="화면">
        {SHOTS.map((s) => (
          // eslint 대신 크기를 직접 적어 화면이 흔들리지 않게 한다.
          <img key={s.src} src={s.src} alt={s.alt} width={390} height={844} loading="lazy" />
        ))}
      </section>

      <section aria-label="데이터 출처">
        <h2>데이터 출처</h2>
        <p>실제 서비스에서는 공공데이터포털 자료를 사용하고 출처를 표시합니다. 이 저장소의 예제 화면에 나오는 가게는 가상 데이터입니다.</p>
      </section>

      <section aria-label="자주 묻는 질문">
        <h2>자주 묻는 질문</h2>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <section aria-label="글">
        <h2>업데이트와 사용법</h2>
        <ul>
          {updates.map((p) => (
            <li key={p.slug}>
              <Link href={`/updates/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
          {guides.map((p) => (
            <li key={p.slug}>
              <Link href={`/guides/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
