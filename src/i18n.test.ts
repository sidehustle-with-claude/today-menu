import { beforeEach, describe, expect, it, vi } from "vitest";
import ko from "../locales/ko.json";
import en from "../locales/en.json";
import { findProblems } from "./i18n-check";
import { overages, measure } from "../scripts/check-store-length";
import { setLang, t, lang } from "./i18n";
import { fmtNumber } from "./format";

describe("번역 파일 검사", () => {
  it("실제 ko/en 은 문제가 없다", () => {
    expect(findProblems(ko, en)).toEqual([]);
  });
  it("누락, 빈 값, 자리 표시 불일치를 찾는다", () => {
    const k = { a: "{weather}이라", b: "x", c: "y" };
    const e = { a: "because {category}", b: " " };
    const p = findProblems(k, e);
    expect(p).toContain("자리 표시 불일치: a");
    expect(p).toContain("빈 값: b");
    expect(p).toContain("누락: c");
  });
});

describe("t()", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    setLang("ko");
  });
  it("자리 표시를 채운다", () => {
    expect(t("result.reason", { weather: "비 오는 날", category: "한식" })).toBe("비 오는 날이라 한식을 골랐어요");
  });
  it("영어로 바꾸면 영어가 나온다", () => {
    setLang("en");
    expect(lang).toBe("en");
    expect(t("search.button")).toBe("Get picks");
    expect(fmtNumber(1234.5)).toBe("1,234.5");
  });
  it("없는 키는 키 이름을 돌려주고 경고한다", () => {
    expect(t("nope.key")).toBe("nope.key");
    expect(console.warn).toHaveBeenCalled();
  });
});

describe("스토어 글자 수", () => {
  it("제한 안이면 통과, 넘으면 초과량을 알려 준다", () => {
    expect(overages({ "play-short.txt": "a".repeat(80) })).toEqual([]);
    expect(overages({ "play-short.txt": "a".repeat(85) })).toEqual(["play-short.txt: 5자 초과 (85/80)"]);
  });
  it("키워드는 바이트로 센다(한글은 3바이트)", () => {
    expect(measure("가".repeat(34)).bytes).toBe(102);
    expect(overages({ "appstore-keywords.txt": "가".repeat(34) })).toHaveLength(1);
  });
});
