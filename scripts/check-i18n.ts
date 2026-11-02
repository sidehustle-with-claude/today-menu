// 누락과 깨짐 검사. 하나라도 있으면 종료 코드 1.
import { readFileSync } from "node:fs";
import { findProblems } from "../src/i18n-check";

const ko = JSON.parse(readFileSync("locales/ko.json", "utf8"));
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));

const problems = findProblems(ko, en);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`번역 검사 통과 (키 ${Object.keys(ko).length}개)`);
