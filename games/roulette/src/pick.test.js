import test from "node:test";
import assert from "node:assert/strict";
import { MENUS, pickIndex, indexAtPointer, stopRotation } from "./pick.js";

test("pickIndex는 rng 값에 따라 칸 번호를 고른다", () => {
  assert.equal(pickIndex(6, () => 0), 0);
  assert.equal(pickIndex(6, () => 0.999999), 5);
  assert.equal(pickIndex(6, () => 0.5), 3);
});

test("pickIndex는 범위를 벗어난 rng 값을 거부한다", () => {
  assert.throws(() => pickIndex(6, () => 1), RangeError);
  assert.throws(() => pickIndex(6, () => -0.1), RangeError);
});

test("뽑은 칸에 맞춰 돌린 각도는 화살표 아래에서 같은 칸을 가리킨다", () => {
  for (let i = 0; i < MENUS.length; i++) {
    for (const offset of [-0.4, 0, 0.4]) {
      const rotation = stopRotation(i, MENUS.length, 4, offset);
      assert.equal(indexAtPointer(rotation, MENUS.length), i, `칸 ${i}, offset ${offset}`);
    }
  }
});

test("바퀴 수가 달라도 결과 칸은 같다", () => {
  for (const spins of [3, 4, 5, 8]) {
    assert.equal(indexAtPointer(stopRotation(2, 6, spins)), 2);
  }
});

test("20번 뽑아도 모든 결과가 칸 번호 범위 안에 있다", () => {
  for (let n = 0; n < 20; n++) {
    const i = pickIndex();
    assert.ok(i >= 0 && i < MENUS.length);
  }
});
