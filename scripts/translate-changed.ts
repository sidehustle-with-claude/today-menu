// 예제 20-3: scripts/translate-changed.ts (뼈대)
// 바뀐 키만 골라 보여 준다. 모델 호출은 19장의 complete() 로 채운다(이 파일은 호출하지 않는다).
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const ko = JSON.parse(readFileSync("locales/ko.json", "utf8"));
const en = existsSync("locales/en.json")
  ? JSON.parse(readFileSync("locales/en.json", "utf8")) : {};
const prev = existsSync("locales/ko.prev.json")
  ? JSON.parse(readFileSync("locales/ko.prev.json", "utf8")) : {};

const changed = Object.keys(ko).filter(
  (k) => ko[k] !== prev[k] || en[k] === undefined,
);
console.log(`번역할 키 ${changed.length}개`, changed);
// 여기서 changed 키만 모아 모델에 보내고 en.json에 합칩니다.
writeFileSync("locales/ko.prev.json", JSON.stringify(ko, null, 2));
