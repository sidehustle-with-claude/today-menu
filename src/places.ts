import data from "../public/data/restaurants.json";
import type { Place, Weather } from "./recommend";

// 12장에서 만든 JSON(가상 데이터). 가게 이름·영업시간 같은 사실은 여기서만 가져온다.
export type Restaurant = Place & { area: string; hours: string };

export const restaurants: Restaurant[] = data as Restaurant[];

// 날씨는 18장에서 진짜 날씨 API로 바뀌기 전까지 손으로 넣은 값을 쓴다.
export const MOCK_WEATHER: Weather = { rain: true, tempC: 8 };
