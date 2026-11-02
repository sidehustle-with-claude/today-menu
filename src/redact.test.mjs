import test from "node:test";
import assert from "node:assert/strict";
import { redactPersonalInfo } from "./redact.mjs";

test("전화번호를 가린다", () => {
  assert.equal(redactPersonalInfo("연락처 010-1234-5678 입니다"), "연락처 [가림] 입니다");
  assert.equal(redactPersonalInfo("01012345678"), "[가림]");
  assert.equal(redactPersonalInfo("02-123-4567"), "[가림]");
});

test("이메일을 가린다", () => {
  assert.equal(redactPersonalInfo("mail: sample.user@example.com 으로"), "mail: [가림] 으로");
});

test("주민등록번호 형태를 가린다", () => {
  assert.equal(redactPersonalInfo("900101-1234567"), "[가림]");
});

test("개인정보가 없는 취향 문장은 그대로 둔다", () => {
  assert.equal(redactPersonalInfo("매운 거 말고 혼밥"), "매운 거 말고 혼밥");
  assert.equal(redactPersonalInfo("2인분 12000원 이하"), "2인분 12000원 이하");
});

test("문자열이 아닌 값도 깨지지 않는다", () => {
  assert.equal(redactPersonalInfo(undefined), "");
  assert.equal(redactPersonalInfo(null), "");
});
