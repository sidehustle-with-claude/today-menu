// 37장 결제: 성공, 실패, 취소(그리고 금액 조작) 네 경우를 가짜 결제창으로 돌린다.
// 실서비스 키가 환경에 있으면 테스트를 바로 멈춘다.
import { test, expect } from "@playwright/test";

const live = /^live_/.test(process.env.TOSS_SECRET_KEY ?? "") || /^live_/.test(process.env.TOSS_CLIENT_KEY ?? "");
if (live) throw new Error("실서비스 키(live_)가 환경변수에 있어 결제 테스트를 멈춥니다.");

async function statusOf(request: import("@playwright/test").APIRequestContext, orderId: string) {
  const res = await request.get(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`);
  return (await res.json()) as { status: string; premium: boolean };
}

async function startOrder(page: import("@playwright/test").Page) {
  await page.goto("/premium");
  const [res] = await Promise.all([
    page.waitForResponse("**/api/payments/order"),
    page.getByRole("button", { name: /프리미엄 1개월 결제/ }).click(),
  ]);
  return (await res.json()).orderId as string;
}

test("성공: 승인되면 paid 이고 프리미엄이 켜진다", async ({ page, request }) => {
  const orderId = await startOrder(page);
  await page.getByRole("button", { name: "결제 성공" }).click();
  await expect(page.getByText("프리미엄이 켜졌습니다")).toBeVisible();
  expect(await statusOf(request, orderId)).toEqual({ status: "paid", premium: true });
});

test("실패: 카드가 거절되면 failed 이고 프리미엄은 켜지지 않는다", async ({ page, request }) => {
  const orderId = await startOrder(page);
  await page.getByRole("button", { name: "카드 거절" }).click();
  await expect(page.getByText("프리미엄은 켜지지 않았습니다")).toBeVisible();
  await expect.poll(async () => (await statusOf(request, orderId)).status).toBe("failed");
  expect((await statusOf(request, orderId)).premium).toBe(false);
});

test("취소: 창을 닫으면 canceled 이고 프리미엄은 켜지지 않는다", async ({ page, request }) => {
  const orderId = await startOrder(page);
  await page.getByRole("button", { name: "결제창 닫기" }).click();
  await expect(page.getByText("결제를 취소했습니다")).toBeVisible();
  await expect.poll(async () => (await statusOf(request, orderId)).status).toBe("canceled");
  expect((await statusOf(request, orderId)).premium).toBe(false);
});

test("금액을 바꿔 보내면 승인하지 않고 amount_mismatch 로 남는다", async ({ page, request }) => {
  const orderId = await startOrder(page);
  await page.goto(`/premium/success?paymentKey=mock_ok_tamper&orderId=${orderId}&amount=1`);
  await expect(page.getByText("금액이 다릅니다")).toBeVisible();
  expect(await statusOf(request, orderId)).toEqual({ status: "amount_mismatch", premium: false });
});
