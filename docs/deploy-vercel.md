# Vercel 배포 메모

예제 서비스를 Vercel에 올릴 때 순서와 값을 모아 둔 문서입니다. 가입, GitHub 연결 승인, 결제는 사람이 직접 합니다.

## 가져오기(Import)

1. Vercel 대시보드에서 새 프로젝트를 만들고 GitHub 저장소 `today-menu` 하나만 허용해서 가져옵니다.
2. 프레임워크가 Next.js 로 자동 감지되는지 확인합니다. 빌드 명령(`npm run build`)과 출력 폴더는 기본값 그대로 둡니다.
3. 환경변수는 넣지 않고 먼저 배포해 봅니다.

## 환경변수

값은 Vercel 화면(Settings, Environment Variables)에만 넣습니다. 이 저장소의 어떤 파일에도 실제 값을 쓰지 않습니다.

| 이름 | 어디서 읽나 | 종류 | 환경 | 비고 |
| --- | --- | --- | --- | --- |
| `DATA_GO_KR_KEY` | 서버 | Secret | Production, Preview | 공공데이터포털 인증키 (18장) |
| `ANTHROPIC_API_KEY` | 서버 | Secret | Production | 17장. Preview 에는 넣지 않거나 낮은 상한의 별도 키 |
| `TASTE_MODEL` | 서버 | Config | Production, Preview | 모델 이름 |
| `MOCK_LLM` | 서버 | Config | Preview | `1` 이면 모델을 부르지 않는다 |
| `MOCK_TOOLS` | 서버 | Config | Preview | `1` 이면 공공 API 를 부르지 않는다 |

- 변수를 바꿔도 이미 만들어진 배포에는 적용되지 않습니다. 새 배포부터 적용되므로 키를 넣은 뒤에는 다시 배포(Redeploy)합니다.
- `NEXT_PUBLIC_` 으로 시작하는 이름은 브라우저로 나갑니다. 비밀 키에는 붙이지 않습니다.
- 환경변수 이름은 `.env.example` 과 같아야 합니다.

## Preview 와 Production

- 브랜치를 푸시하면 Preview 배포가 만들어집니다. 풀 리퀘스트 화면이나 대시보드에서 주소를 확인합니다.
- main 에 합치면 Production 이 갱신됩니다.
- 빌드가 실패한 배포는 Production 에 나가지 않습니다. 실패 로그를 읽고 원인을 한 줄로 정리한 뒤 고칩니다. 오류를 숨기려고 검사를 끄지 않습니다.

## Vercel CLI

설치: `npm i -g vercel`, 로그인: `vercel login` (브라우저 승인은 사람이 합니다).

| 읽기 명령 | 하는 일 |
| --- | --- |
| `vercel list` | 최근 배포 목록 |
| `vercel inspect <배포주소>` | 배포 정보 |
| `vercel logs` | 런타임 로그 |
| `vercel env ls` | 환경변수 이름 목록 |

사람이 확인하고 실행하는 명령: `vercel remove`, `vercel domains rm`, `vercel env rm`, `vercel deploy --prod`.
`vercel env pull` 은 비밀 값이 든 파일을 내 컴퓨터에 만들므로 `.gitignore` 에 들어 있는지 먼저 확인합니다.

## 자주 막히는 곳

- 빌드 명령이나 출력 폴더가 틀림: `package.json` 의 scripts 를 읽고 화면 값과 맞춥니다.
- Node 버전 불일치: `package.json` 의 `engines.node` 를 `>=22` 로 두었습니다. 화면(Settings, Build and Deployment, Node.js Version)도 확인합니다.
- 로컬에서는 되는데 배포에서만 안 됨: 변수 이름 오타, 환경(Production, Preview) 체크, 다시 배포를 차례로 봅니다.
