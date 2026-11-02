import { describe, expect, it } from "vitest";
import { adsTxt, adsenseEnabled, adsensePub } from "./adsense";

describe("adsense", () => {
  it("형식이 맞는 게시자 ID 만 받는다", () => {
    expect(adsensePub("pub-1234567890123456")).toBe("pub-1234567890123456");
    expect(adsensePub("pub-123")).toBeNull();
    expect(adsensePub("ca-pub-1234567890123456")).toBeNull();
    expect(adsensePub(undefined)).toBeNull();
  });
  it("책의 가짜 값은 켜지 않는다", () => {
    expect(adsensePub("pub-0000000000000000")).toBeNull();
  });
  it("운영 환경에서만 켠다", () => {
    expect(adsenseEnabled("production", "pub-1234567890123456")).toBe(true);
    expect(adsenseEnabled("development", "pub-1234567890123456")).toBe(false);
    expect(adsenseEnabled("production", "")).toBe(false);
  });
  it("ads.txt 는 내 줄 하나뿐이다", () => {
    expect(adsTxt("pub-1234567890123456")).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
    expect(adsTxt("")).toBeNull();
  });
});
