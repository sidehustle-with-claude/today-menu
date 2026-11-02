---
type: knowledge
topic: api
status: active
updated: 2026-11-01
---

# 목록 API는 비어 있어도 200을 돌려준다

- 증상: 데이터가 없는데 오류가 나지 않아 수집이 성공한 것처럼 보였다
- 원인: 이 API는 빈 목록도 정상 응답으로 처리한다
- 대처: 상태 코드가 아니라 `items` 길이로 성공을 판단한다
