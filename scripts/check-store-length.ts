// store/en/ 의 파일마다 글자 수와 바이트 수를 세서 스토어 제한과 비교한다. 넘으면 파일 이름과 초과량을 출력한다.
// 제한은 2026년 11월 공식 도움말 기준(앱스토어 연결 도움말, Play Console 도움말). 바뀌면 이 표만 고친다.
import { existsSync, readFileSync } from "node:fs";

export const LIMITS: Record<string, { chars?: number; bytes?: number }> = {
  "appstore-promo.txt": { chars: 170 },
  "appstore-description.txt": { chars: 4000 },
  "appstore-keywords.txt": { bytes: 100 },
  "play-title.txt": { chars: 30 },
  "play-short.txt": { chars: 80 },
  "play-full.txt": { chars: 4000 },
};

export function measure(text: string) {
  const body = text.replace(/\n+$/, "");
  return { chars: [...body].length, bytes: Buffer.byteLength(body, "utf8") };
}

export function overages(files: Record<string, string>): string[] {
  const out: string[] = [];
  for (const [name, limit] of Object.entries(LIMITS)) {
    if (!(name in files)) continue;
    const m = measure(files[name]);
    if (limit.chars !== undefined && m.chars > limit.chars) out.push(`${name}: ${m.chars - limit.chars}자 초과 (${m.chars}/${limit.chars})`);
    if (limit.bytes !== undefined && m.bytes > limit.bytes) out.push(`${name}: ${m.bytes - limit.bytes}바이트 초과 (${m.bytes}/${limit.bytes})`);
  }
  return out;
}

function main() {
  const dir = process.argv[2] ?? "store/en";
  const files: Record<string, string> = {};
  for (const name of Object.keys(LIMITS)) {
    const p = `${dir}/${name}`;
    if (existsSync(p)) files[name] = readFileSync(p, "utf8");
  }
  for (const [name, text] of Object.entries(files)) {
    const m = measure(text);
    console.log(`${name}: ${m.chars}자, ${m.bytes}바이트`);
  }
  const bad = overages(files);
  if (bad.length) {
    console.error(bad.join("\n"));
    process.exit(1);
  }
  console.log("스토어 글자 수 통과");
}

if (process.argv[1]?.endsWith("check-store-length.ts")) main();
