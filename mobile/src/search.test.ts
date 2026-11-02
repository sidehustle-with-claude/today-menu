import assert from 'node:assert/strict';
import { test } from 'node:test';

import { allPlaces, searchPlaces } from './search';

test('망원동을 검색하면 카드가 정확히 3개 나온다', () => {
  assert.equal(searchPlaces('망원동').length, 3);
});

test('앞뒤 공백은 무시한다', () => {
  assert.equal(searchPlaces('  연남동 ').length, 3);
});

test('빈 입력과 없는 동네는 빈 목록이다', () => {
  assert.deepEqual(searchPlaces(''), []);
  assert.deepEqual(searchPlaces('없는동네'), []);
});

test('데이터의 가게 id는 서로 다르다', () => {
  const ids = allPlaces.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});
