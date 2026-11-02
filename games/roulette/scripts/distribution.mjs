// START를 N번 누른 것과 같은 방식(뽑기 함수 + 멈춤 각도)으로 결과 분포를 센다.
// 실행: node scripts/distribution.mjs [횟수]   (기본 20)
import { MENUS, pickIndex, stopRotation, indexAtPointer } from "../src/pick.js";

const runs = Number(process.argv[2]) || 20;
const counts = Object.fromEntries(MENUS.map((m) => [m, 0]));
let mismatch = 0;

for (let n = 0; n < runs; n++) {
  const i = pickIndex();
  const rotation = stopRotation(i, MENUS.length, 4, (Math.random() - 0.5) * 0.8);
  if (indexAtPointer(rotation) !== i) mismatch++;
  counts[MENUS[i]]++;
}

console.log(`${runs}번 돌린 결과`);
for (const [menu, c] of Object.entries(counts)) console.log(`- ${menu}: ${c}`);
console.log(`멈춘 칸과 뽑은 칸이 다른 횟수: ${mismatch}`);
process.exit(mismatch === 0 ? 0 : 1);
