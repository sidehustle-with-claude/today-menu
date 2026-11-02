import type { Metadata } from "next";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "지원 | 오늘 뭐 먹지",
  description: "오늘 뭐 먹지 문의 방법과 자주 묻는 질문입니다.",
  alternates: { canonical: "/support" },
};

const FAQ = [
  { q: "추천이 나오지 않아요", a: "동네 이름을 끝까지 적었는지, 눌러 둔 메뉴 버튼이 있는지 확인해 주세요. 목록에 없는 동네는 나오지 않습니다." },
  { q: "즐겨찾기가 사라졌어요", a: "로그인하지 않으면 즐겨찾기는 이 기기의 브라우저에만 저장됩니다. 브라우저 데이터를 지우면 함께 사라집니다." },
  { q: "내 정보를 지우고 싶어요", a: "아래 이메일로 요청해 주세요. 서버에 저장한 이메일과 즐겨찾기를 지워 드립니다." },
];

export default function Support() {
  return (
    <main className="wide doc">
      <h1>지원</h1>
      <h2>문의하기</h2>
      <p>
        {/* TODO: 공개하기 전에 실제 문의 이메일로 바꾼다. 지금은 예시 값이다. */}
        문의는 <a href="mailto:contact@example.com">contact@example.com</a>(예시)으로 보내 주세요.
      </p>
      <h2>자주 묻는 질문</h2>
      {FAQ.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
      <SiteFooter />
    </main>
  );
}
