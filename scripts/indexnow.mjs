#!/usr/bin/env node
// 예제 36-1: 바뀐 주소를 IndexNow 로 알린다. 사용법은 아래와 같다.
//   node scripts/indexnow.mjs --dry-run /guides/neighborhood-not-found     (보낼 내용만 보여 줌, 기본값)
//   SITE_URL=https://내주소 node scripts/indexnow.mjs --send /updates/2026-11
// 새 글을 올렸거나 크게 고쳤을 때만 보낸다. 키는 public/{키}.txt 파일 이름에서 읽고 화면에는 출력하지 않는다.
import { readdirSync } from "node:fs";
import { join } from "node:path";

const ENDPOINT = process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow";
const MAX_PER_REQUEST = 10; // 한 번에 10개를 넘기지 않는다 (공식 한도는 10,000개)

const MEANING = {
  200: "성공: 접수됐습니다",
  202: "접수됨: 키 확인을 기다립니다",
  400: "형식 오류: 보낸 JSON 을 확인하세요",
  403: "키가 틀림: 키 파일이 열리는지, 파일 내용과 보낸 키가 같은지 확인하세요",
  422: "URL 이 호스트와 맞지 않음: 보내는 주소가 키 파일과 같은 호스트인지 확인하세요",
  429: "너무 잦은 요청: 멈추고 간격을 두세요",
};

export function findKey(dir = "public") {
  const files = readdirSync(dir).filter((f) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(f));
  return files.length ? files[0].replace(/\.txt$/, "") : null;
}

export function chunk(list, size = MAX_PER_REQUEST) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export function buildPayload(siteUrl, key, paths) {
  const base = new URL(siteUrl);
  return {
    host: base.host,
    key,
    keyLocation: `${base.origin}/${key}.txt`,
    urlList: paths.map((p) => new URL(p, base.origin).toString()),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const send = args.includes("--send");
  const paths = args.filter((a) => !a.startsWith("--"));
  const siteUrl = process.env.SITE_URL ?? "https://today-menu.example.com";
  if (paths.length === 0) {
    console.error("보낼 주소가 없습니다. 예: node scripts/indexnow.mjs --dry-run /updates/2026-11");
    process.exit(2);
  }
  const key = findKey(join(process.cwd(), "public"));
  if (!key) {
    console.error("public/ 아래에 {키}.txt 파일이 없습니다.");
    process.exit(2);
  }
  const batches = chunk(paths).map((p) => buildPayload(siteUrl, key, p));
  console.log(`대상 사이트 ${new URL(siteUrl).host}, 주소 ${paths.length}개, 요청 ${batches.length}번`);

  for (const payload of batches) {
    const hidden = `****(${payload.key.length}자)`;
    const shown = { ...payload, key: hidden, keyLocation: payload.keyLocation.replace(payload.key, hidden) };
    if (!send) {
      console.log("보내지 않음(--dry-run). 보낼 내용:", JSON.stringify(shown));
      continue;
    }
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    console.log(`응답 ${res.status}: ${MEANING[res.status] ?? "표에 없는 응답입니다. 공식 문서를 확인하세요"}`);
    if (res.status === 429) break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
