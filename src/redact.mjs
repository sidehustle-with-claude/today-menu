// LLM에 글을 보내기 전에 개인정보처럼 보이는 문자열을 지운다.
// 전화번호, 이메일, 주민등록번호 형태를 [가림]으로 바꾼다. 완벽한 검사가 아니라 마지막 안전망이다.
const PATTERNS = [
  // 주민등록번호: 6자리-7자리
  /\b\d{6}\s*-\s*[1-4]\d{6}\b/g,
  // 이메일
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  // 전화번호: 010-1234-5678, 02-123-4567, 01012345678
  /\b0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}\b/g,
];

export function redactPersonalInfo(text) {
  let out = String(text ?? "");
  for (const re of PATTERNS) out = out.replace(re, "[가림]");
  return out;
}
