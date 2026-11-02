import type { Metadata } from "next";
import Home from "../home";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "오늘 뭐 먹지 열기: 동네와 메뉴로 추천 받기",
  description: "동네 이름과 메뉴를 고르면 오늘 갈 만한 곳 3곳을 보여 줍니다.",
  alternates: { canonical: "/menu" },
};

// 33장부터 `/` 는 소개 페이지이고 서비스 화면은 `/menu` 에 있다.
export default function MenuPage() {
  return (
    <>
      <Home />
      <div className="foot-wrap">
        <SiteFooter />
      </div>
    </>
  );
}
