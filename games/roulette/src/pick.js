// 결과 칸을 먼저 뽑고, 그 칸에 맞는 각도를 계산한다. 화면 각도로 결과를 정하지 않는다.
export const MENUS = ["한식", "분식", "카페", "중식", "일식", "양식"];

// rng는 0 이상 1 미만의 수를 돌려주는 함수. 테스트에서는 고정값 함수를 넣는다.
export function pickIndex(count = MENUS.length, rng = Math.random) {
  const r = rng();
  if (!(r >= 0 && r < 1)) throw new RangeError("rng must return a number in [0, 1)");
  return Math.floor(r * count);
}

// 칸 i의 중심은 위쪽(화살표 위치)에서 시계 방향으로 (i + 0.5) * 칸각도 만큼 떨어져 있다.
// 돌림판을 시계 방향으로 rotation도 돌렸을 때 화살표 아래에 오는 칸의 번호를 돌려준다.
export function indexAtPointer(rotationDeg, count = MENUS.length) {
  const slice = 360 / count;
  const under = (((-rotationDeg) % 360) + 360) % 360;
  return Math.floor(under / slice) % count;
}

// 칸 i의 중심이 화살표 아래에 오는 최종 각도(도). spins는 추가로 도는 바퀴 수, offset은 칸 안에서 벗어난 정도(-0.4~0.4)
export function stopRotation(index, count = MENUS.length, spins = 4, offset = 0) {
  const slice = 360 / count;
  const center = (index + 0.5 + offset) * slice;
  return spins * 360 + (360 - center);
}
