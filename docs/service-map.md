# 외부 서비스와 처리방침 대응표

외부 서비스를 하나 붙일 때마다 이 표와 `docs/privacy-policy.md` 를 함께 고칩니다. 34장(GA), 37장(결제), 38장(광고)에서 이 문서로 돌아옵니다.

| 외부 서비스 | 코드에서 쓰는 곳 | 보내는 정보 | 처리방침에 반영된 곳 |
| --- | --- | --- | --- |
| Anthropic API | `src/parse-taste.ts`, `src/ask.ts` | 한 줄 취향 문장 (개인정보는 지운 뒤) | 5. 처리 위탁 |
| Supabase | `src/supabase.ts`, `src/favorites-supabase.ts` | 로그인 이메일, 즐겨찾기 | 1. 수집하는 항목, 5. 처리 위탁 |
| Cloudflare Workers, D1 | `src/favorites-api.ts`, `workers/favorites` | 즐겨찾기 | 5. 처리 위탁 |
| 공공데이터포털 | `src/tools-impl.ts` | 날씨 격자 좌표, 지역 코드 (사용자 개인정보 아님) | 해당 없음 (가게 정보 출처는 약관 3) |
| Google Gemini API | `src/llm.ts` (비교 실습용) | 서비스 화면에서는 쓰지 않음 | 해당 없음 |
| Google Analytics | `app/google-analytics.tsx`, `src/analytics.ts` | 방문 페이지, 기기 정보, `favorite_add` 의 메뉴 종류 | 1. 수집하는 항목, 5. 처리 위탁(방문 통계와 거부 방법 포함) |
| 토스페이먼츠 | `src/payments/gateway.ts`, `app/premium/checkout.tsx` | 주문 번호, 금액, 결제 키 (카드 정보는 결제창에서 직접 입력) | 1. 수집하는 항목, 3. 보유·이용 기간, 5. 처리 위탁 |
| 광고 | 아직 없음 | | 38장에서 추가 |

반영되지 않은 서비스는 없습니다(2026년 11월 이 시점 기준, 코드 검색으로 확인).
