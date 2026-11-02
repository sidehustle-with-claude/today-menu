import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="바닥글 링크">
        <Link href="/menu">오늘 뭐 먹지 열기</Link>
        <Link href="/privacy">개인정보처리방침</Link>
        <Link href="/support">지원</Link>
      </nav>
    </footer>
  );
}
