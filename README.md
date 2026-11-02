# today-menu

책 "누워서 클로드로 부업하기"에서 만드는 예제 서비스 "오늘 뭐 먹지"와, 책이 약속한 체크리스트·치트시트 저장소입니다.

- 동네와 메뉴를 고르면 오늘 갈 만한 곳을 보여 주는 웹 서비스입니다.
- 데이터는 전부 가상입니다. 실제 가게, 실제 사용자, 실제 키는 들어 있지 않습니다.
- 외부 서비스(AI, 지도, 결제, 광고, 알림)는 목업이나 테스트 값으로만 동작하고, 키는 `.env.example` 의 이름만 보여 줍니다.

## 폴더

| 위치 | 내용 |
| --- | --- |
| `checklists/` | 부록 A 장별 체크리스트와 부록 B·C·D (`checklists/README.md` 에 쓰는 법) |
| `cheatsheet/` | 부록 E 치트시트 (명령어, 프롬프트) |
| `app/`, `src/`, `public/`, `content/` | 웹 서비스 (Next.js) |
| `tests/` | 화면 시험 (Playwright). 단위 시험은 `src/` 와 `scripts/` 옆에 있습니다 |
| `mobile/` | 모바일 앱 (Expo) |
| `games/roulette/` | 룰렛 게임 |
| `workers/favorites/` | 즐겨찾기 API (Cloudflare Workers, D1) |
| `docs/` | 처리방침 초안, 심사 자료, 운영 문서 |
| `scripts/`, `hooks/`, `tools/` | 자동화 스크립트, 클로드 훅, 문서 생성 도구 |
| `ERRATA.md` | 정오표 |
| `CHANGELOG.md` | 변경 기록 |

## 장별 태그

- 장을 끝낸 상태마다 태그를 붙였습니다. 2장은 `ch02`, 10장은 `ch10` 입니다. 0장과 1장은 파일이 없어 태그가 없습니다.
- 책을 따라가다 막히면 해당 태그로 내 작업과 비교해 보세요.

```bash
git tag --list "ch*"
git diff ch09 ch10          # 10장에서 바뀐 것
git switch --detach ch10    # 10장 끝 상태 보기
```

## 웹 서비스 실행

Node.js가 필요합니다. 확인한 버전은 Node 25.8 입니다.

```bash
cp .env.example .env     # 값은 비워 두거나 가짜 값으로 둡니다
npm ci
npm run dev              # http://localhost:3000
npm test                 # 단위 시험과 번역 검사
npm run build
npm run e2e              # 화면 시험 (처음에 npx playwright install chromium)
```

- AI 호출은 `MOCK_LLM=1`, 공공 API 호출은 `MOCK_TOOLS=1` 로 막아 두면 요금이 들지 않습니다.
- 결제는 키를 비우면 가짜 결제창이 나옵니다. `live_` 로 시작하는 키는 코드가 거부합니다.

## 안전 규칙

- 진짜 키, 비밀번호, 개인정보를 이 저장소에 올리지 않습니다.
- 책과 저장소가 다르면 저장소가 맞습니다. 틀린 곳은 Issues 의 "정오표 제보"로 알려 주세요. 개인정보와 키는 쓰지 마세요.
- 법령 내용(개인정보, 전자상거래 등)은 이 저장소가 판단하지 않습니다. 문서의 `[확인 필요]` 는 직접 원문으로 확인하세요.

## 라이선스

MIT. `LICENSE` 를 보세요.
