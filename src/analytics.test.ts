import { describe, expect, it, vi } from "vitest";
import { gaEnabled, gaId, track } from "./analytics";

describe("gaId", () => {
  it("올바른 측정 ID 만 쓴다", () => {
    expect(gaId("G-ABC1234567")).toBe("G-ABC1234567");
    expect(gaId("UA-123")).toBeNull();
    expect(gaId("")).toBeNull();
    expect(gaId(undefined)).toBeNull();
  });

  it("책의 가짜 값은 켜지지 않는다", () => {
    expect(gaId("G-XXXXXXXXXX")).toBeNull();
  });
});

describe("gaEnabled", () => {
  it("운영 환경에서 측정 ID 가 있을 때만 켜진다", () => {
    expect(gaEnabled("production", "G-ABC1234567")).toBe(true);
    expect(gaEnabled("development", "G-ABC1234567")).toBe(false);
    expect(gaEnabled("production", "")).toBe(false);
  });
});

describe("track", () => {
  it("favorite_add 에는 menu_category 만 보낸다", () => {
    const gtag = vi.fn();
    const ok = track("favorite_add", { menu_category: "한식", email: "a@example.com", place: "가상 국밥집" }, { gtag });
    expect(ok).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "favorite_add", { menu_category: "한식" });
  });

  it("정해 두지 않은 이벤트는 보내지 않는다", () => {
    const gtag = vi.fn();
    expect(track("anything_else", { menu_category: "한식" }, { gtag })).toBe(false);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("gtag 가 없어도 에러가 나지 않는다", () => {
    expect(track("favorite_add", { menu_category: "한식" }, {})).toBe(false);
    expect(track("favorite_add", { menu_category: "한식" }, undefined)).toBe(false);
  });

  it("긴 값은 40자로 자른다", () => {
    const gtag = vi.fn();
    track("favorite_add", { menu_category: "가".repeat(100) }, { gtag });
    expect(gtag.mock.calls[0][2].menu_category.length).toBe(40);
  });
});
