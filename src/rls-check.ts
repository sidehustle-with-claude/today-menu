// "RLS 없는 표는 만들지 않는다"를 파일로 검사한다.
// db/*.sql 에서 만든 표마다 (1) RLS 를 켰는지 (2) 정책이 하나 이상 있는지 본다.

export function findRlsProblems(sql: string): string[] {
  const text = sql.replace(/--.*$/gm, "").toLowerCase();
  const tables = [...text.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/g)].map((m) => m[1]);
  const problems: string[] = [];
  for (const t of tables) {
    const enabled = new RegExp(`alter\\s+table\\s+(?:public\\.)?${t}\\s+enable\\s+row\\s+level\\s+security`).test(text);
    const hasPolicy = new RegExp(`create\\s+policy\\s+"[^"]*"\\s+on\\s+(?:public\\.)?${t}\\b`).test(text);
    if (!enabled) problems.push(`RLS 꺼짐: ${t}`);
    if (!hasPolicy) problems.push(`정책 없음: ${t}`);
  }
  if (/\b(drop|truncate)\b/.test(text)) problems.push("drop 또는 truncate 가 들어 있음");
  return problems;
}
