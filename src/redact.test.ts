import { test, expect } from "vitest";
import { redactPersonalInfo } from "./redact";

test("전화번호를 가린다", () => {
  expect(redactPersonalInfo("연락처 010-1234-5678 입니다")).toBe("연락처 [가림] 입니다");
  expect(redactPersonalInfo("01012345678")).toBe("[가림]");
  expect(redactPersonalInfo("02-123-4567")).toBe("[가림]");
});

test("이메일을 가린다", () => {
  expect(redactPersonalInfo("mail: sample.user@example.com 으로")).toBe("mail: [가림] 으로");
});

test("주민등록번호 형태를 가린다", () => {
  expect(redactPersonalInfo("900101-1234567")).toBe("[가림]");
});

test("개인정보가 없는 취향 문장은 그대로 둔다", () => {
  expect(redactPersonalInfo("매운 거 말고 혼밥")).toBe("매운 거 말고 혼밥");
  expect(redactPersonalInfo("2인분 12000원 이하")).toBe("2인분 12000원 이하");
});

test("문자열이 아닌 값도 깨지지 않는다", () => {
  expect(redactPersonalInfo(undefined)).toBe("");
  expect(redactPersonalInfo(null)).toBe("");
});
