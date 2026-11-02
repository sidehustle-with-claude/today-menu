# Bing 등록, IndexNow, AI 크롤러 기록

확인된 것과 확인되지 않은 것을 나눠 적습니다. 로그인, 계정 인증, 약관 동의는 본인이 직접 합니다.

## 확인된 것

- OpenAI 문서(https://developers.openai.com/api/docs/bots, 2026년 11월 기준)는 OAI-SearchBot 을 ChatGPT 검색 기능에 사이트를 보여 주기 위한 크롤러로, GPTBot 을 모델 학습용 수집으로 구분합니다. 두 설정은 서로 독립입니다.
- IndexNow 는 키 파일 `{키}.txt` 를 사이트 루트에 두고 바뀐 주소를 알리는 방식입니다(https://www.indexnow.org/documentation).

## 확인되지 않은 것

- "Bing 에 등록하면 ChatGPT 에 나온다"는 공식 근거를 찾지 못했습니다. 단정하지 않습니다.
- `llms.txt` 의 효과는 확인되지 않았습니다. 이 저장소는 만들지 않았습니다.
- 구글의 IndexNow 지원 여부는 확인되지 않았습니다.

## 이 저장소의 선택

| 크롤러 | 설정 | 이유 |
| --- | --- | --- |
| OAI-SearchBot | 허용 | ChatGPT 검색에도 보이게 하기 위해 |
| GPTBot | 차단 | 학습 수집은 거부하기 위해 |
| 그 밖의 로봇 | 허용 | 일반 검색을 막지 않기 위해 |

- 선택은 `app/robots.ts` 한 곳에 있고 `src/robots.test.ts` 가 지킵니다.
- 이 선택이 맞는지는 서비스의 목적에 따라 달라서 정답은 없습니다.
- robots.txt 를 바꾸면 반영에 약 24시간이 걸릴 수 있습니다.
- robots.txt 는 강제 차단이 아닙니다. 숨겨야 하는 정보는 로그인이나 접근 제어로 지킵니다.

## IndexNow

- 키 파일은 `public/` 아래에 있습니다. 이 저장소의 키는 예시이며 본인 사이트에서는 새로 만들어 씁니다. 다른 사이트에서 재사용하지 않습니다.
- `node scripts/indexnow.mjs /updates/2026-11` 은 보내지 않고 내용만 보여 줍니다.
- 실제로 보내려면 `SITE_URL=https://내주소 node scripts/indexnow.mjs --send /updates/2026-11` 을 씁니다. 새 글을 올렸거나 크게 고쳤을 때만 보냅니다.
- 응답 200, 202 는 접수, 403 은 키 문제, 422 는 호스트 불일치, 429 는 너무 잦은 요청입니다. 429 가 오면 멈춥니다.

## Bing Webmaster Tools

- 서치콘솔에서 가져오는 방법이 가장 쉽습니다. 안 되면 CNAME, 메타 태그, XML 파일로 확인합니다.
- 메타 태그를 쓸 때는 받은 값을 환경변수 `BING_SITE_VERIFICATION` 에 넣습니다(`src/verification.ts`).
- 사이트맵은 구글과 같은 `sitemap.xml` 을 씁니다.
- 화면과 상태 문구는 자주 바뀌므로 Bing 웹마스터 도움말(https://www.bing.com/webmasters/help)을 보고 따라갑니다.

## 기록

- `docs/ai-search-log.csv` 에 2주 간격으로 같은 질문을 Bing, ChatGPT 검색, 구글에서 해 보고 결과를 적습니다.
- 나온 날과 안 나온 날을 모두 적고, 적지 않은 결과를 추측해서 채우지 않습니다.
- AI 답변은 같은 질문에도 매번 다르므로 여러 번의 기록으로 봅니다.
