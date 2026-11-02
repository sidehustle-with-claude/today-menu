// 예제 16-1: src/recommend.ts
// 같은 입력이면 항상 같은 결과가 나온다. 랜덤, 현재 시각, 네트워크 호출을 쓰지 않는다.
export type Place = {
  id: string; name: string; category: string;
  distanceM: number; indoor: boolean; soupy: boolean; solo: boolean;
};
export type Weather = { rain: boolean; tempC: number };
export type Filter = { category?: string; avoid?: string[]; solo?: boolean };

export function score(p: Place, f: Filter, w: Weather): number {
  let s = 0;
  if (f.category && p.category === f.category) s += 50;
  s += Math.max(0, 30 - p.distanceM / 100);
  if (w.rain && p.indoor) s += 10;
  if ((w.rain || w.tempC < 5) && p.soupy) s += 10;
  if (f.solo && p.solo) s += 10;
  return s;
}

// 가게 데이터에 동네·영업시간 같은 열이 더 있어도 그대로 돌려주도록 T 로 받는다.
export function recommend<T extends Place>(ps: T[], f: Filter, w: Weather): T[] {
  const avoid = f.avoid ?? [];
  return ps
    .filter((p) => !avoid.some((a) => p.name.includes(a)))
    .map((p) => ({ p, s: score(p, f, w) }))
    .sort((a, b) =>
      b.s - a.s || a.p.distanceM - b.p.distanceM ||
      a.p.id.localeCompare(b.p.id))
    .slice(0, 3)
    .map((x) => x.p);
}
