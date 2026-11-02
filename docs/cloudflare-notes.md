# Cloudflare Workers와 D1 메모

## 로컬과 원격을 섞지 않는 법

| 하고 싶은 일 | 로컬 | 원격 (사람이 확인하고 실행) |
| --- | --- | --- |
| 마이그레이션 적용 | `wrangler d1 migrations apply today-menu-db --local` | `wrangler d1 migrations apply today-menu-db --remote` |
| SQL 실행 | `wrangler d1 execute today-menu-db --local --command="..."` | `wrangler d1 execute today-menu-db --remote --command="..."` |
| 남은 마이그레이션 보기 | `wrangler d1 migrations list today-menu-db --local` | `wrangler d1 migrations list today-menu-db --remote` |

- 어느 쪽이 기본인지 문서에 적혀 있지 않으므로 항상 플래그를 직접 씁니다.
- 로컬에 적용했다고 배포된 서비스에 반영된 것이 아닙니다. 배포 전에 원격 `migrations list` 로 빠진 것이 없는지 봅니다.

## CORS

웹 주소와 API 주소가 다르면 브라우저가 요청을 막습니다. Worker 는 `ALLOWED_ORIGIN` 에 적은 웹 주소 하나만 응답 헤더에 넣고, 별표(*)로 모두 허용하지 않습니다.
웹을 Vercel 에 올린 뒤에는 `wrangler.jsonc` 의 `ALLOWED_ORIGIN` 을 그 주소로 바꿉니다.

## 한도 (공식 문서 기준, 값은 바뀔 수 있음)

무료 플랜은 요청당 CPU 시간이 짧습니다(약 10ms). 큰 JSON 을 한꺼번에 계산하지 않습니다.
