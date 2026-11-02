// 가입한 사용자에게 환영 메일을 보내는 서버 함수 (42장)
// 공식 문서: https://resend.com/docs/api-reference/emails/send-email
//
// 규칙
// - 키는 환경변수 RESEND_API_KEY 에서만 읽는다. 코드와 프론트에 넣지 않는다.
// - 받는 주소 형식을 먼저 확인한다.
// - 메일 본문에는 사용자 이름 외의 개인정보를 넣지 않는다.
// - DRY_RUN 이 1(기본값)이면 보내지 않고 보낼 내용만 돌려준다.

export type WelcomeResult =
  | { ok: true; dryRun: true; preview: { from: string; to: string[]; subject: string; html: string } }
  | { ok: true; dryRun: false; id: string }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

// 이름에 < > & 같은 글자가 있어도 메일 HTML 이 깨지거나 남의 코드가 들어가지 않게 한다
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildWelcomeHtml(name: string): string {
  const safe = escapeHtml(name.trim().slice(0, 40) || "회원");
  return `<p>${safe}님, 가입을 환영합니다.</p><p>동네를 고르면 오늘 메뉴를 추천해 드려요.</p>`;
}

export async function sendWelcomeEmail(to: string, name: string): Promise<WelcomeResult> {
  if (!isValidEmail(to)) {
    return { ok: false, error: "받는 주소 형식이 맞지 않습니다" };
  }
  const from = process.env.MAIL_FROM || "오늘 뭐 먹지 <hello@example.com>";
  const payload = {
    from,
    to: [to],
    subject: "가입을 환영합니다",
    html: buildWelcomeHtml(name),
  };

  if ((process.env.DRY_RUN ?? "1") !== "0") {
    return { ok: true, dryRun: true, preview: payload };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("여기에")) {
    return { ok: false, error: "RESEND_API_KEY 가 .env 에 없습니다" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    return { ok: false, error: `발송 실패 (HTTP ${response.status})` };
  }
  const body = (await response.json()) as { id?: string };
  return { ok: true, dryRun: false, id: body.id ?? "" };
}
