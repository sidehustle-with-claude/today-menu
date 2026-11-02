# SEO 기본기 점검표

32장 점검 결과를 남기는 표입니다. 배포한 주소에서 `scripts/seo-check.sh https://내주소` 를 돌려 확인합니다.
색인과 순위는 검색 엔진이 정하므로 이 표를 다 채워도 노출을 약속할 수 없습니다.

| 항목 | 이 저장소의 처리 | 확인 방법 |
| --- | --- | --- |
| 페이지별 title | 홈은 `app/layout.tsx`, 가게 상세는 `generateMetadata` 로 가게마다 다름 | 브라우저 탭, `curl` |
| meta description | 홈 고정 문구, 가게 상세는 가게별 문구 | `curl` |
| h1 | 페이지당 하나 | 화면 확인 |
| robots.txt | `app/robots.ts`: 전체 허용 + Sitemap 한 줄 | `/robots.txt` |
| sitemap.xml | `app/sitemap.ts`: 홈과 가게 상세. lastmod 만 쓰고 priority/changefreq 는 쓰지 않음 | `/sitemap.xml` |
| 개인 화면 | 즐겨찾기·로그인은 별도 주소가 없어 사이트맵에 넣을 것이 없음 | 코드 확인 |
| 서버 렌더링 | 가게 상세는 서버에서 HTML 로 만들어 내려옴. 홈의 추천 목록은 브라우저에서 그림 | `curl` 로 본문 확인 |
| 사이트 주소 | `src/site.ts` 의 `SITE_URL`. 기본값은 가짜 예시 주소 | 환경변수 `NEXT_PUBLIC_SITE_URL` |
| lastmod | `CONTENT_UPDATED` 를 내용이 바뀐 날에만 직접 고침 | `src/site.ts` |

## 알려진 한계

- 홈의 추천 카드는 브라우저에서 그려지므로 `curl` 결과에는 보이지 않습니다. 33장에서 소개 페이지를 서버에서 만들어 이 부분을 채웁니다.
- Lighthouse 점수는 이 저장소에 넣지 않았습니다. 배포한 주소에서 크롬이나 `lighthouse` 명령으로 직접 재야 합니다.
