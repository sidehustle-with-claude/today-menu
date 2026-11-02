import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockGateway, tossGateway } from "./gateway";
import { isLiveKey, LiveKeyError, paymentMode } from "./mode";
import { confirmPayment, createOrder, handleWebhook, isPremium, PaymentError, recordFailure, type Deps } from "./service";
import { MemoryOrderStore } from "./store";

let deps: Deps & { gateway: MockGateway };

beforeEach(() => {
  deps = { store: new MemoryOrderStore(), gateway: new MockGateway() };
});

describe("성공", () => {
  it("금액이 같고 승인되면 paid 가 되고 프리미엄이 켜진다", async () => {
    const o = await createOrder(deps.store);
    const done = await confirmPayment(deps, { paymentKey: "mock_ok_1", orderId: o.orderId, amount: o.amount });
    expect(done.status).toBe("paid");
    expect(isPremium(done)).toBe(true);
  });

  it("같은 승인 요청이 다시 와도 결제 서비스를 한 번만 부른다", async () => {
    const spy = vi.spyOn(deps.gateway, "confirm");
    const o = await createOrder(deps.store);
    const q = { paymentKey: "mock_ok_2", orderId: o.orderId, amount: o.amount };
    await confirmPayment(deps, q);
    await confirmPayment(deps, q);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("금액 확인", () => {
  it("넘어온 금액이 저장한 금액과 다르면 승인을 부르지 않고 amount_mismatch 로 남긴다", async () => {
    const spy = vi.spyOn(deps.gateway, "confirm");
    const o = await createOrder(deps.store);
    await expect(confirmPayment(deps, { paymentKey: "mock_ok_3", orderId: o.orderId, amount: 1 })).rejects.toThrow("금액이 다릅니다");
    expect(spy).not.toHaveBeenCalled();
    expect((await deps.store.find(o.orderId))?.status).toBe("amount_mismatch");
  });

  it("없는 주문은 404 이다", async () => {
    await expect(confirmPayment(deps, { paymentKey: "mock_ok_4", orderId: "nope", amount: 3900 })).rejects.toMatchObject({ status: 404 });
  });
});

describe("실패", () => {
  it("승인이 거절되면 failed 이고 프리미엄은 꺼져 있다", async () => {
    const o = await createOrder(deps.store);
    await expect(confirmPayment(deps, { paymentKey: "mock_fail_1", orderId: o.orderId, amount: o.amount })).rejects.toBeInstanceOf(PaymentError);
    const after = await deps.store.find(o.orderId);
    expect(after?.status).toBe("failed");
    expect(isPremium(after)).toBe(false);
  });

  it("끝난 주문은 다시 승인하지 않는다", async () => {
    const o = await createOrder(deps.store);
    await recordFailure(deps.store, { orderId: o.orderId, code: "PAY_REJECT_CARD_COMPANY" });
    await expect(confirmPayment(deps, { paymentKey: "mock_ok_5", orderId: o.orderId, amount: o.amount })).rejects.toMatchObject({ status: 409 });
  });
});

describe("취소", () => {
  it("사용자가 창을 닫으면(PAY_PROCESS_CANCELED) canceled 이다", async () => {
    const o = await createOrder(deps.store);
    const after = await recordFailure(deps.store, { orderId: o.orderId, code: "PAY_PROCESS_CANCELED" });
    expect(after?.status).toBe("canceled");
    expect(isPremium(after)).toBe(false);
  });

  it("환불 웹훅이 오면 paid 가 canceled 로 바뀌고 프리미엄이 꺼진다", async () => {
    const o = await createOrder(deps.store);
    await confirmPayment(deps, { paymentKey: "mock_ok_6", orderId: o.orderId, amount: o.amount });
    deps.gateway.cancel("mock_ok_6");
    const r = await handleWebhook(deps, { eventType: "PAYMENT_STATUS_CHANGED", createdAt: "t1", data: { paymentKey: "mock_ok_6", status: "CANCELED" } });
    expect(r.handled).toBe(true);
    expect(isPremium(await deps.store.find(o.orderId))).toBe(false);
  });
});

describe("웹훅", () => {
  it("결제 서비스에 다시 확인해서 DONE 이면 paid 로 바꾼다", async () => {
    const o = await createOrder(deps.store);
    await deps.gateway.confirm({ paymentKey: "mock_ok_7", orderId: o.orderId, amount: o.amount }); // 창을 닫아 승인 호출이 없었던 경우
    const r = await handleWebhook(deps, { eventType: "PAYMENT_STATUS_CHANGED", createdAt: "t1", data: { paymentKey: "mock_ok_7", status: "DONE" } });
    expect(r.handled).toBe(true);
    expect((await deps.store.find(o.orderId))?.status).toBe("paid");
  });

  it("같은 이벤트가 두 번 와도 한 번만 처리한다", async () => {
    const o = await createOrder(deps.store);
    await deps.gateway.confirm({ paymentKey: "mock_ok_8", orderId: o.orderId, amount: o.amount });
    const spy = vi.spyOn(deps.store, "mark");
    const body = { eventType: "PAYMENT_STATUS_CHANGED", createdAt: "t1", data: { paymentKey: "mock_ok_8", status: "DONE" } };
    const a = await handleWebhook(deps, body);
    const b = await handleWebhook(deps, body);
    expect(a.handled).toBe(true);
    expect(b).toEqual({ handled: false, reason: "duplicate" });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("가짜 웹훅(결제 서비스에 없는 paymentKey)은 무시한다", async () => {
    const o = await createOrder(deps.store);
    const r = await handleWebhook(deps, { eventType: "PAYMENT_STATUS_CHANGED", createdAt: "t1", data: { paymentKey: "forged", status: "DONE", orderId: o.orderId } });
    expect(r).toEqual({ handled: false, reason: "unverified" });
    expect((await deps.store.find(o.orderId))?.status).toBe("pending");
  });

  it("웹훅 본문이 이상하면 무시한다", async () => {
    expect(await handleWebhook(deps, null)).toEqual({ handled: false, reason: "malformed" });
    expect(await handleWebhook(deps, { eventType: "OTHER", data: { paymentKey: "x" } })).toEqual({ handled: false, reason: "malformed" });
  });

  it("결제 서비스에 물어보다 실패하면 예외를 내고 이벤트를 처리한 것으로 표시하지 않는다", async () => {
    const failing: Deps = { store: deps.store, gateway: { confirm: async () => ({ ok: false }), lookup: async () => { throw new Error("네트워크"); } } };
    const body = { eventType: "PAYMENT_STATUS_CHANGED", createdAt: "t1", data: { paymentKey: "k" } };
    await expect(handleWebhook(failing, body)).rejects.toThrow();
    expect(await deps.store.claimEvent("PAYMENT_STATUS_CHANGED:k:DONE:t1")).toBe(true);
  });
});

describe("토스페이먼츠 호출 모양", () => {
  it("승인 호출은 시크릿 키를 Basic 인증으로 보낸다", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 200 }));
    await tossGateway("test_sk_example", fetchFn as unknown as typeof fetch).confirm({ paymentKey: "p", orderId: "o", amount: 3900 });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.tosspayments.com/v1/payments/confirm");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Basic ${Buffer.from("test_sk_example:").toString("base64")}`);
    expect(JSON.parse(init.body as string)).toEqual({ paymentKey: "p", orderId: "o", amount: 3900 });
  });

  it("조회가 404 이면 null 이다", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 404 }));
    expect(await tossGateway("test_sk_example", fetchFn as unknown as typeof fetch).lookup("p")).toBeNull();
  });
});

describe("키 확인", () => {
  it("실서비스 키(live_)가 있으면 멈춘다", () => {
    expect(isLiveKey("live_sk_abc")).toBe(true);
    expect(() => paymentMode({ TOSS_SECRET_KEY: "live_sk_abc" })).toThrow(LiveKeyError);
    expect(() => paymentMode({ TOSS_CLIENT_KEY: "live_gck_abc" })).toThrow(LiveKeyError);
  });

  it("테스트 키는 test, 키가 없으면 개발에서만 mock 이다", () => {
    expect(paymentMode({ TOSS_SECRET_KEY: "test_sk_abc" })).toBe("test");
    expect(paymentMode({ NODE_ENV: "development" })).toBe("mock");
    expect(paymentMode({ NODE_ENV: "production" })).toBe("off");
    expect(paymentMode({ NODE_ENV: "production", PAYMENTS_MOCK: "1" })).toBe("mock");
  });

  it("지금 실행 환경에 실서비스 키가 없다", () => {
    expect(isLiveKey(process.env.TOSS_SECRET_KEY)).toBe(false);
    expect(isLiveKey(process.env.TOSS_CLIENT_KEY)).toBe(false);
  });
});
