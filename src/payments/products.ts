// 파는 물건과 값은 서버가 정한다. 브라우저가 보낸 금액은 믿지 않는다.
// 가격은 연습용 가정이다. 실제로 얼마를 받을지는 이 저장소의 범위 밖이다.
export const PRODUCT = {
  id: "premium-1m",
  name: "프리미엄 1개월",
  amount: 3900,
} as const;
