// 20장의 언어 전환. 글자가 언어마다 달라지므로 이 파일만 영어 글자로 잡는다.
import { test, expect } from "@playwright/test";

test("English 버튼을 누르면 화면 문구가 영어로 바뀐다", async ({ page }) => {
  await page.goto("/menu");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("오늘 뭐 먹지");

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What to Eat Today");
  await expect(page.getByRole("button", { name: "Get picks" })).toBeVisible();
  // 중괄호 자리 표시가 그대로 찍히면 번역이 깨진 것이다.
  await expect(page.locator("body")).not.toContainText("{weather}");
});
