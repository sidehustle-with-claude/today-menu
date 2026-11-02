import { describe, expect, it } from "vitest";
import { verificationMeta } from "./verification";

describe("verificationMeta", () => {
  it("값이 없으면 아무것도 넣지 않는다", () => {
    expect(verificationMeta({})).toBeUndefined();
    expect(verificationMeta({ GOOGLE_SITE_VERIFICATION: "  " })).toBeUndefined();
  });

  it("값이 있으면 google 확인 태그를 만든다", () => {
    expect(verificationMeta({ GOOGLE_SITE_VERIFICATION: "abc123" })).toEqual({ google: "abc123" });
  });
});
