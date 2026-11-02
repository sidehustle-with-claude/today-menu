# DNS 레코드 표 (30장)

도메인은 예약 도메인 `example.com`을 쓴 가짜 값입니다. 내 도메인으로 바꿔 읽으세요.
값은 책의 값을 외워 넣지 말고, 각 서비스 화면에 나온 값을 복사합니다.

## 한눈에 보는 연결표

| 연결 대상 | 이름(호스트) | 종류 | 값 | 값을 복사할 곳 |
|---|---|---|---|---|
| Vercel 웹(apex) | `example.com` | A | 프로젝트 Domains 화면에 나온 IP (공식 문서 예시 76.76.21.21) | Vercel → Settings → Domains |
| Vercel 웹(www) | `www.example.com` | CNAME | 프로젝트마다 고유한 값 (예: `d1d4fc829fe7bc7c.vercel-dns-017.com` 형태) | 같은 화면 |
| GitHub Pages 블로그 | `blog.example.com` | CNAME | `<내-계정>.github.io` (저장소 이름을 붙이지 않음) | 내 GitHub 계정 이름 |

## GitHub Pages를 apex 도메인에 쓸 때

공식 문서의 A 레코드 4개를 모두 넣습니다. 선택으로 AAAA 4개와, 등록기관이 지원하면 ALIAS/ANAME 하나로 대신할 수도 있습니다.

| 종류 | 값 |
|---|---|
| A | 185.199.108.153 |
| A | 185.199.109.153 |
| A | 185.199.110.153 |
| A | 185.199.111.153 |

## 순서 규칙

1. GitHub Pages는 저장소 Settings → Pages의 Custom domain에 서브도메인을 먼저 넣고 저장합니다.
2. 그다음에 DNS에서 CNAME 레코드를 만듭니다. (남이 내 서브도메인에서 사이트를 호스팅하는 사고를 막기 위해서입니다)
3. 'Enforce HTTPS'가 선택 가능해지면 켭니다. 최대 24시간이 걸릴 수 있습니다.

## 하지 않는 것

- 와일드카드 레코드(`*.example.com`)를 만들지 않습니다.
- 소유권 확인용 TXT 레코드는 확인이 끝난 뒤에도 지우지 않습니다.
- 같은 이름에 A·AAAA·CNAME을 겹쳐 두지 않습니다.
- 네임서버를 통째로 옮기기 전에 기존 MX·TXT 레코드를 새 DNS로 먼저 복사합니다.

## dig로 확인하기

내 도메인과 복사한 값을 `infra/dns/records.csv`에 적고(양식은 `infra/dns/records.example.csv`) 돌립니다.

```bash
cp infra/dns/records.example.csv infra/dns/records.csv   # 내 도메인과 값으로 고친다
DRY_RUN=1 scripts/check-dns.sh                            # 실행할 dig 명령만 본다
scripts/check-dns.sh                                      # 실제 조회
```

- 직접 쳐 볼 때: `dig example.com +noall +answer -t A`
- 이 스크립트는 조회만 합니다. DNS를 바꾸지 않고, DNS 계정의 비밀번호나 API 키도 쓰지 않습니다.
- 레코드를 넣는 일은 사람이 등록기관 화면에서 합니다.
- 윈도우에는 `dig`가 없어 PowerShell의 `Resolve-DnsName`을 씁니다.

## 도메인 유지

| 할 일 | 날짜(직접 채우기) |
|---|---|
| 도메인 갱신가 확인(첫해가 아니라 갱신가) | |
| 자동 갱신 켬 | |
| 결제 카드 만료일 | |
| 만료 30일 전 달력 알림 | |
