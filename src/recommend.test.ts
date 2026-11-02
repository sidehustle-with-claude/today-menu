import { describe, expect, it } from "vitest";
import { recommend, type Place, type Weather } from "./recommend";

// 실제 데이터 파일이 바뀌어도 테스트가 변하지 않게 가게 데이터를 여기에 직접 적는다.
function place(over: Partial<Place> & { id: string }): Place {
  return {
    name: `가게-${over.id}`,
    category: "한식",
    distanceM: 1000,
    indoor: true,
    soupy: false,
    solo: false,
    ...over,
  };
}

const dry: Weather = { rain: false, tempC: 20 };

describe("recommend", () => {
  it("1. 카테고리 한식을 고르면 한식 2곳이 앞에 온다", () => {
    const ps = [
      place({ id: "a", category: "분식" }),
      place({ id: "b", category: "한식" }),
      place({ id: "c", category: "분식" }),
      place({ id: "d", category: "한식" }),
    ];
    const out = recommend(ps, { category: "한식" }, dry);
    expect(out.slice(0, 2).map((p) => p.id)).toEqual(["b", "d"]);
  });

  it("2. 비 오는 날 점수가 같으면 실내가 앞에 온다", () => {
    const ps = [
      place({ id: "a", indoor: false }),
      place({ id: "b", indoor: true }),
    ];
    const out = recommend(ps, {}, { rain: true, tempC: 20 });
    expect(out.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("3. 영하의 날에는 국물 메뉴가 앞에 온다", () => {
    const ps = [
      place({ id: "a", soupy: false }),
      place({ id: "b", soupy: true }),
    ];
    const out = recommend(ps, {}, { rain: false, tempC: -3 });
    expect(out.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("4. 점수와 거리가 모두 같으면 id 순서로 줄 선다", () => {
    const ps = [place({ id: "c" }), place({ id: "a" }), place({ id: "b" })];
    const out = recommend(ps, {}, dry);
    expect(out.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("5. 가게가 2곳뿐이면 2곳만 돌려주고 오류가 없다", () => {
    const ps = [place({ id: "a" }), place({ id: "b" })];
    expect(recommend(ps, {}, dry)).toHaveLength(2);
  });

  it("avoid에 든 글자가 이름에 있으면 뺀다", () => {
    const ps = [place({ id: "a", name: "매운 국밥" }), place({ id: "b", name: "순한 국밥" })];
    const out = recommend(ps, { avoid: ["매운"] }, dry);
    expect(out.map((p) => p.id)).toEqual(["b"]);
  });

  it("원본 배열을 바꾸지 않는다", () => {
    const ps = [place({ id: "b" }), place({ id: "a" })];
    const before = ps.map((p) => p.id);
    recommend(ps, {}, dry);
    expect(ps.map((p) => p.id)).toEqual(before);
  });
});
