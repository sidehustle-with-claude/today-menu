import { describe, expect, it } from "vitest";
import { verificationMeta } from "./verification";

describe("verificationMeta", () => {
  it("값이 없으면 아무것도 넣지 않는다", () => {
    expect(verificationMeta({})).toBeUndefined();
  });

  it("google 과 bing 값을 각각 태그로 만든다", () => {
    expect(verificationMeta({ GOOGLE_SITE_VERIFICATION: "g1" })).toEqual({ google: "g1" });
    expect(verificationMeta({ BING_SITE_VERIFICATION: "b1" })).toEqual({ other: { "msvalidate.01": "b1" } });
    expect(verificationMeta({ GOOGLE_SITE_VERIFICATION: "g1", BING_SITE_VERIFICATION: "b1" })).toEqual({
      google: "g1",
      other: { "msvalidate.01": "b1" },
    });
  });
});
