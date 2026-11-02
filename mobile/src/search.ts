import placesData from './data/places.json';
import type { Place } from './types';

export const MAX_RESULTS = 3;

export const allPlaces: Place[] = placesData;

// 동네 이름으로 가게를 찾고 최대 3곳만 돌려준다. 비어 있거나 없는 동네면 빈 목록.
export function searchPlaces(neighborhood: string, places: Place[] = allPlaces): Place[] {
  const query = neighborhood.trim();
  if (query === '') return [];
  return places.filter((p) => p.neighborhood === query).slice(0, MAX_RESULTS);
}
