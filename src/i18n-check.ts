// 예제 20-4 의 핵심을 테스트할 수 있게 함수로 뺀 것
type Dict = Record<string, string>;

const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");

export function findProblems(ko: Dict, en: Dict): string[] {
  const problems: string[] = [];
  for (const k of Object.keys(ko)) {
    if (!(k in en)) problems.push(`누락: ${k}`);
    else if (!en[k].trim()) problems.push(`빈 값: ${k}`);
    else if (ph(ko[k]) !== ph(en[k])) problems.push(`자리 표시 불일치: ${k}`);
  }
  for (const k of Object.keys(en)) {
    if (!(k in ko)) problems.push(`한쪽에만 있음(en): ${k}`);
  }
  return problems;
}
