// 예제 20-2: src/format.ts
import { lang } from "./i18n";

const locale = () => (lang === "en" ? "en-US" : "ko-KR");

export const fmtNumber = (n: number) =>
  new Intl.NumberFormat(locale()).format(n);

export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat(locale(), { dateStyle: "medium" }).format(d);

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat(locale(), {
    style: "currency", currency: "KRW",
  }).format(n);

// 이 책의 예제는 가격을 보여 주지 않아서 거리(m)만 형식을 맞춘다.
export const fmtDistance = (m: number) => `${fmtNumber(m)} m`;
