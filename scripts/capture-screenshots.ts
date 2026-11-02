// 예제 33-1: 소개 페이지에 쓰는 스크린샷 3장을 실제 화면에서 찍는다.
// 사용법: 터미널 1) npm run build && npx next start -p 3100   터미널 2) npx tsx scripts/capture-screenshots.ts
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = "public/images";

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: "ko-KR" });
  const page = await ctx.newPage();

  // 취향 서버는 부르지 않고 미리 준비한 가짜 응답을 돌려준다.
  await page.route("**/api/taste", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ filter: { category: "분식" } }) }),
  );

  await page.goto(`${BASE}/menu`);
  await page.getByLabel("동네 이름").fill("새솔동");
  await page.getByRole("button", { name: "추천 받기" }).click();
  await page.getByRole("article").first().waitFor();
  await page.screenshot({ path: `${OUT}/today-menu-recommend-cards.png` });

  await page.getByLabel("한 줄 취향").fill("가볍게 분식");
  await page.getByRole("button", { name: "반영" }).click();
  await page.getByText("취향을 반영했어요.").waitFor();
  await page.screenshot({ path: `${OUT}/today-menu-taste-input.png` });

  const name = (await page.getByRole("article").first().getByRole("heading").innerText()).trim();
  await page.getByRole("article").first().getByRole("link", { name }).click();
  await page.waitForURL(/\/place\//);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.screenshot({ path: `${OUT}/today-menu-place-detail.png` });

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
