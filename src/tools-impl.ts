// 툴 함수: 실제로 공공 API를 부르는 코드. 키는 서버 환경변수 DATA_GO_KR_KEY 에서만 읽는다.
// MOCK_TOOLS=1 이면 네트워크 없이 samples/ 의 가상 응답으로 돌아간다 (개발과 테스트는 이 길로 한다).
//
// 확인 못 한 것: 아래 호출 주소(오퍼레이션 이름)와 응답 필드는 책이 공식 상세 페이지에서 확정하지 못한 부분이다.
// 실제 키로 처음 호출할 때 SAVE_SAMPLES=1 로 원본을 samples/ 에 저장하고, 개발가이드 문서와 맞춰 본다.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cacheKey, cached } from "./cache";

export type WeatherResult = { tempC: number; rain: boolean; source: string };
export type PlaceItem = { name: string; addr: string; tel: string };
export type PlacesResult = { places: PlaceItem[]; source: string };

const WEATHER_URL =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
const PLACES_URL = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2";

const isMock = () => process.env.MOCK_TOOLS === "1";

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, "utf8"));
}

function saveSample(name: string, raw: unknown) {
  if (process.env.SAVE_SAMPLES !== "1") return;
  mkdirSync("samples", { recursive: true });
  writeFileSync(`samples/${name}`, JSON.stringify(raw, null, 2));
}

function serviceKey(): string {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) throw new Error("DATA_GO_KR_KEY 환경변수가 없습니다");
  return key;
}

// 기상청 초단기실황 응답에서 기온(T1H)과 강수형태(PTY, 0이 아니면 비·눈)만 꺼낸다.
export function parseWeather(raw: any): WeatherResult {
  const items = raw?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) throw new Error("결과 없음: 날씨 응답이 비었습니다");
  const value = (cat: string) => items.find((i: any) => i.category === cat)?.obsrValue;
  const t1h = Number(value("T1H"));
  const pty = Number(value("PTY"));
  if (Number.isNaN(t1h)) throw new Error("결과 없음: 기온 값을 찾지 못했습니다");
  return { tempC: t1h, rain: pty !== 0, source: "기상청 초단기실황" };
}

// TourAPI 응답에서 가게당 이름·주소·전화번호 3개만 추려 상위 8개를 돌려준다.
export function parsePlaces(raw: any): PlacesResult {
  const items = raw?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) throw new Error("결과 없음: 가게 응답이 비었습니다");
  const places = items.slice(0, 8).map((i: any) => ({
    name: String(i.title ?? ""),
    addr: String(i.addr1 ?? ""),
    tel: String(i.tel ?? ""),
  }));
  return { places, source: "한국관광공사 TourAPI" };
}

export async function getWeather(dong: string): Promise<WeatherResult> {
  if (isMock()) return parseWeather(readJson("samples/weather.mock.json"));
  const grid = readJson("data/grid.json")[dong];
  if (!grid || !grid.nx || !grid.ny) {
    throw new Error(`'${dong}'의 격자 좌표(nx, ny)가 data/grid.json 에 없습니다`);
  }
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600_000);
  const iso = kst.toISOString();
  const params = new URLSearchParams({
    serviceKey: serviceKey(),
    pageNo: "1",
    numOfRows: "10",
    dataType: "JSON",
    base_date: iso.slice(0, 10).replaceAll("-", ""),
    base_time: iso.slice(11, 13) + "00",
    nx: String(grid.nx),
    ny: String(grid.ny),
  });
  const key = cacheKey("weather", dong, iso.slice(0, 13));
  return cached(key, async () => {
    const res = await fetch(`${WEATHER_URL}?${params}`);
    if (!res.ok) throw new Error(`날씨 조회 실패(HTTP ${res.status})`);
    const raw = await res.json();
    saveSample("weather.raw.json", raw);
    return parseWeather(raw);
  });
}

export async function getPlaces(dong: string, category?: string): Promise<PlacesResult> {
  if (isMock()) {
    return parsePlaces(readJson("samples/places.mock.json"));
  }
  const params = new URLSearchParams({
    serviceKey: serviceKey(),
    MobileOS: "ETC",
    MobileApp: "today-menu",
    _type: "json",
    contentTypeId: "39",
    keyword: `${dong} ${category ?? "음식점"}`.trim(),
    numOfRows: "8",
    pageNo: "1",
  });
  const key = cacheKey("places", dong, category ?? "", "v1");
  return cached(key, async () => {
    const res = await fetch(`${PLACES_URL}?${params}`);
    if (!res.ok) throw new Error(`가게 조회 실패(HTTP ${res.status})`);
    const raw = await res.json();
    saveSample("places.raw.json", raw);
    return parsePlaces(raw);
  });
}
