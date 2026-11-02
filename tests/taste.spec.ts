// 17장의 한 줄 취향. 서버 호출(/api/taste)을 가로채 미리 준비한 가짜 응답을 돌려준다.
// 진짜 모델을 부르지 않으므로 요금도 한도도 없고, 늘 같은 답이 나온다.
import { test, expect } from "@playwright/test";
import fixture from "./fixtures/taste.json";

test("한 줄 취향을 반영하면 가짜 응답의 메뉴가 먼저 나온다", async ({ page }) => {
  await page.route("**/api/taste", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fixture) }),
  );

  await page.goto("/menu");
  await page.getByLabel("한 줄 취향").fill("가볍게 분식");
  await page.getByRole("button", { name: "반영" }).click();

  await expect(page.getByText("취향을 반영했어요.")).toBeVisible();
  await expect(page.getByRole("article").first()).toContainText("분식");
});

test("취향 서버가 실패해도 화면은 멈추지 않는다", async ({ page }) => {
  await page.route("**/api/taste", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "취향을 읽지 못했어요." }) }),
  );

  await page.goto("/menu");
  await page.getByLabel("한 줄 취향").fill("아무거나");
  await page.getByRole("button", { name: "반영" }).click();
  await expect(page.getByText("취향을 읽지 못했어요.")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(3);
});
