// 평가 세트 채점 스크립트. 채점은 코드가 하므로 비용이 없고 항상 같은 결과가 나온다.
// 실행: node eval/score.js [예측 모듈 경로]   (기본 eval/predict-baseline.js)
// 예측 모듈은 문장(문자열)을 받아 필터 {category?, avoid?, solo?}를 돌려주는 함수를 내보낸다.
const path = require("path");
const cases = require("./cases.json");

const predictPath = path.resolve(process.argv[2] || path.join(__dirname, "predict-baseline.js"));
const predict = require(predictPath);

function normalize(f) {
  const out = {};
  if (f && f.category) out.category = f.category;
  if (f && Array.isArray(f.avoid) && f.avoid.length) out.avoid = [...f.avoid].sort();
  if (f && f.solo === true) out.solo = true;
  return out;
}

function same(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

let correct = 0;
const wrong = [];
for (const c of cases) {
  const got = predict(c.input);
  if (same(got, c.expected)) correct++;
  else wrong.push({ id: c.id, input: c.input, expected: normalize(c.expected), got: normalize(got) });
}

console.log(`맞은 개수: ${correct} / ${cases.length}`);
if (wrong.length) {
  console.log("틀린 항목:");
  for (const w of wrong) {
    console.log(`- ${w.id} "${w.input}"`);
    console.log(`  기대: ${JSON.stringify(w.expected)}`);
    console.log(`  결과: ${JSON.stringify(w.got)}`);
  }
}
