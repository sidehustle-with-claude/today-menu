// 예제 21-1: tests/search.spec.ts
// 동네 검색 -> 추천 카드 3개 -> 첫 카드 -> 상세 화면. 화면에 보이는 역할과 글자로 요소를 잡는다.
import { test, expect } from "@playwright/test";

test("동네 검색 후 상세 보기", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("동네 이름").fill("새솔동");
  await page.getByRole("button", { name: "추천 받기" }).click();

  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(3);

  const name = (await cards.first().getByRole("heading").innerText()).trim();
  await cards.first().getByRole("link", { name }).click();
  await expect(page).toHaveURL(/\/place\/r\d+/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
});

test("없는 동네는 안내 문구가 나온다", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("동네 이름").fill("없는동");
  await page.getByRole("button", { name: "추천 받기" }).click();
  await expect(page.getByText("조건에 맞는 곳을 찾지 못했어요")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("즐겨찾기는 새로 고쳐도 남는다", async ({ page }) => {
  await page.goto("/");
  const star = page.getByRole("button", { name: "즐겨찾기" }).first();
  await expect(star).toHaveAttribute("aria-pressed", "false");
  await star.click();
  await expect(star).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "즐겨찾기" }).first()).toHaveAttribute("aria-pressed", "true");
});
