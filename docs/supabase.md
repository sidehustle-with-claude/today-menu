# Supabase 메모

연습용 프로젝트에서만 실행합니다. 실제 사용자 정보는 넣지 않습니다. 프로젝트 만들기, 가입, 확인 메일 링크 누르기는 사람이 합니다.

## 키 종류

| 키 | 모양 | 권한 | 어디에 쓰나 |
| --- | --- | --- | --- |
| 공개 키(publishable) | `sb_publishable_...` | 낮음 | 브라우저, 모바일 앱, 배포되는 코드 |
| 비밀 키(secret) | `sb_secret_...` | 높음 | 내 서버, 함수, 작업 서버만 |
| 예전 anon | 긴 토큰 | 낮음 | 공개 키의 예전 이름 |
| 예전 service_role | 긴 토큰 | 높음 | 비밀 키의 예전 이름 |

비밀 키는 RLS 를 모두 무시합니다. 공개 키가 보여도 괜찮은 이유는 RLS 가 문지기 역할을 하기 때문입니다.

## 순서

1. `db/001_tables.sql` 을 SQL Editor 에서 실행해 `favorites`, `reviews` 표를 만듭니다. 읽어 보고 `drop`, `delete`, `truncate` 가 없는지 확인합니다.
2. RLS 를 켜기 전에 계정 A 로 즐겨찾기를 넣고, 계정 B 로 목록을 불러 봅니다(연습 데이터만). 꺼진 상태에서는 남의 것까지 보일 수 있습니다.
3. `db/002_rls.sql` 을 실행합니다. 같은 확인을 다시 하면 A 에게는 A 것만, B 에게는 B 것만 보여야 합니다.
4. `.env` 에 `NEXT_PUBLIC_SUPABASE_URL` 과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 를 넣고 `npm run dev` 로 로그인 화면을 확인합니다. 배포에서는 Vercel 환경변수(25장)에도 같은 이름으로 넣고 다시 배포합니다.

## RLS 가 켜져 있는지 검사

`npm test` 는 `src/rls-check.test.ts` 로 `db/*.sql` 의 모든 표에 RLS 활성화와 정책이 있는지 검사합니다. 새 표를 만들고 정책을 빼먹으면 테스트가 실패합니다.

## 클로드에게 Supabase 를 연결할 때 (MCP)

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<프로젝트 ID>&read_only=true"
```

- 운영 프로젝트에는 읽기 전용과 프로젝트 한정을 함께 씁니다.
- `--scope project` 는 `.mcp.json` 에 설정이 적혀 Git 에 올라갈 수 있습니다. 키와 비밀번호는 절대 넣지 않습니다.
- 연결할 때 열리는 로그인과 승인 화면은 사람이 처리합니다.

## 연결 문자열과 풀러

| 방식 | 포트 | 언제 쓰나 |
| --- | --- | --- |
| 직접 연결 | 5432 | 오래 켜 둔 서버, 마이그레이션, 백업. 기본은 IPv6 |
| 풀러 세션 모드 | 5432 | IPv4 만 되는 환경, DB 관리 도구 |
| 풀러 트랜잭션 모드 | 6543 | 서버리스, 엣지 함수처럼 짧은 연결이 많을 때 |

트랜잭션 모드는 준비된 구문(prepared statement)을 지원하지 않습니다. 이 저장소의 웹은 공개 키로 직접 부르므로 연결 문자열이 필요 없습니다. 연결 문자열에는 DB 비밀번호가 있으니 환경변수로만 둡니다.
