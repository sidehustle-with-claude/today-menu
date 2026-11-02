// 같은 입력을 100번 넣어 결과 id 목록이 모두 같은지 확인한다.
// 실행: npm run repeat-check
import { recommend } from "../src/recommend";
import { MOCK_WEATHER, restaurants } from "../src/places";

const filter = { category: "한식", avoid: ["매운"], solo: true };
const first = recommend(restaurants, filter, MOCK_WEATHER).map((p) => p.id).join(",");

let different = 0;
for (let i = 0; i < 100; i++) {
  const ids = recommend(restaurants, filter, MOCK_WEATHER).map((p) => p.id).join(",");
  if (ids !== first) different++;
}

console.log(`첫 결과: ${first}`);
console.log(different === 0 ? "100번 모두 같음" : `달라진 횟수: ${different}`);
process.exit(different === 0 ? 0 : 1);
