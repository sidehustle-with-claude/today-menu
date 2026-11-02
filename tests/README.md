# e2e 테스트

- 실행: `npx playwright test --project=chromium` (처음에는 `npx playwright install chromium`)
- 보고서: `npx playwright show-report`
- 이 폴더의 테스트는 가짜 데이터 화면(새솔동, 한울동, 푸른동)과 목업만 씁니다. 실제 키와 실제 가게 정보는 없습니다.
- 현재 앱은 12장의 JSON 파일을 직접 읽고, 네트워크로 부르는 곳은 17장의 `/api/taste` 하나입니다. 그래서 가로채기(`page.route`)는 그 한 곳에 씁니다. 공공데이터 API를 앱이 직접 부르게 되면 같은 방식으로 `tests/fixtures/` 에 가짜 응답을 더합니다.
- 로그인 화면이 생기면(26~27장) `tests/auth.setup.ts` 와 `storageState` 를 더합니다. 저장된 로그인 상태 `playwright/.auth/` 는 `.gitignore` 에 들어 있습니다.
- 테스트가 실패하면 먼저 (가) 앱이 잘못됨 (나) 테스트가 낡음 으로 나눕니다. 내가 허락하기 전에는 기대값을 바꾸지 않습니다.
