# 즐겨찾기 API (Cloudflare Workers + D1)

26장 예제입니다. 이 폴더는 웹(Next.js)과 별개의 프로젝트입니다.

## 로컬에서 시험하기

```bash
cd workers/favorites
npm install
npx wrangler d1 migrations apply today-menu-db --local
npx wrangler dev
```

다른 터미널에서:

```bash
curl -X POST http://localhost:8787/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"place_id":"p1","place_name":"예시 식당"}'
curl http://localhost:8787/api/favorites
```

## 원격 D1 은 사람이 실행합니다

- `npx wrangler d1 create today-menu-db` 가 알려 주는 ID 를 `wrangler.jsonc` 의 `database_id` 에 넣습니다(지금은 자리표시).
- `npx wrangler d1 migrations apply today-menu-db --remote` 는 진짜 데이터에 영향을 줍니다. 적용 전에 `migrations list` 로 남은 것을 보고 사람이 실행합니다.
- 비밀값은 `npx wrangler secret put 이름` 으로 넣고, `wrangler.jsonc` 의 `vars` 에는 쓰지 않습니다.

## 단위 테스트

가짜 D1 로 API 동작을 확인합니다. 저장소 루트에서 `npm test` 가 이 폴더의 테스트도 함께 돌립니다.
