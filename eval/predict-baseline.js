// LLM 없이 규칙만으로 만든 기준선. 채점 스크립트가 돌아가는지 보고, 나중에 LLM 점수와 비교하는 바닥값으로 쓴다.
// 나중에 LLM 호출 코드를 쓸 때는 같은 모양(문장을 받아 필터를 돌려주는 함수)으로 이 파일 자리에 끼운다.
const CATEGORIES = ["한식", "분식", "카페", "중식"];

module.exports = function predict(input) {
  const filter = {};
  // 부정이 들어간 문장은 기준선이 판단하지 않는다.
  if (/말고|빼고|싫어/.test(input) && /(한식|분식|카페|중식)\s*말고/.test(input)) return filter;
  for (const c of CATEGORIES) if (input.includes(c)) filter.category = c;
  if (/커피|빵/.test(input)) filter.category = "카페";
  if (/혼자|혼밥/.test(input)) filter.solo = true;
  const avoid = [];
  for (const m of input.matchAll(/(매운|해산물|짠)[^,]*?(말고|빼고|싫어)/g)) avoid.push(m[1]);
  if (avoid.length) filter.avoid = avoid;
  return filter;
};
