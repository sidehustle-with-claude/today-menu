// 예제 20-1: src/i18n.ts (핵심만)
import ko from "../locales/ko.json";
import en from "../locales/en.json";

const dict: Record<string, Record<string, string>> = { ko, en };
export type Lang = "ko" | "en";
export let lang: Lang = "ko";

export function setLang(next: Lang) {
  lang = next;
  try { localStorage.setItem("lang", next); } catch {}
}

// 처음 열었을 때의 언어: 저장된 선택이 있으면 그것, 없으면 브라우저 언어가 en 으로 시작하면 영어, 아니면 한국어.
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "ko" || saved === "en") return saved;
  } catch {}
  const nav = typeof navigator !== "undefined" ? navigator.language : "ko";
  return nav.toLowerCase().startsWith("en") ? "en" : "ko";
}

export function t(key: string, vars: Record<string, string> = {}) {
  const raw = dict[lang][key] ?? dict.ko[key] ?? key;
  if (dict[lang][key] === undefined) console.warn("missing key", key);
  return raw.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
