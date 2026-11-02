// 33장 소개 페이지와 심사용 주소. 로그인 없이 열리고 h1 이 하나인지 본다.
import { test, expect } from "@playwright/test";

test("소개 페이지는 h1 이 하나이고 서비스로 가는 링크가 있다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await page.getByRole("link", { name: "웹에서 바로 쓰기" }).click();
  await expect(page).toHaveURL(/\/menu$/);
});

test("소개 페이지의 스크린샷에는 alt 가 있다", async ({ page }) => {
  await page.goto("/");
  const imgs = page.locator("img");
  expect(await imgs.count()).toBe(3);
  for (const img of await imgs.all()) {
    expect(((await img.getAttribute("alt")) ?? "").length).toBeGreaterThan(10);
  }
});

test("처리방침과 지원 주소가 열리고 noindex 가 없다", async ({ page }) => {
  for (const path of ["/privacy", "/support"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  }
});

test("업데이트 글과 사용법 글이 열린다", async ({ page }) => {
  await page.goto("/updates/2026-11");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("업데이트");
  await page.goto("/guides/neighborhood-not-found");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("동네가 목록에 없을 때");
});
