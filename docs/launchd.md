# 매일 루틴: launchd와 클라우드 루틴

54장에서 만든 세 가지 일을 어디에 걸지 정리한 문서입니다.

## 고르는 기준

| 구분 | 클라우드 루틴(`/schedule`) | 내 맥의 launchd |
| --- | --- | --- |
| 도는 곳 | Anthropic 관리 환경 | 내 맥 |
| 컴퓨터가 꺼져 있으면 | 상관없음 | 돌지 않음 |
| 로컬 파일 | 없음(저장소를 새로 받음) | 접근 가능 |
| 최소 간격 | 1시간 | 제한 없음 |
| 클로드 필요 여부 | 항상 클로드가 실행 | 스크립트만이면 토큰 0 |
| 어울리는 일 | 판단·요약이 필요한 일 | 정해진 절차 반복 |

- 내 맥의 파일이나 로그인 상태가 필요하면 launchd입니다.
- 판단과 요약이 필요하고 맥이 꺼져도 되면 클라우드입니다.
- 이 저장소의 세 스크립트는 모두 로컬 파일을 쓰므로 launchd 쪽입니다.

## 이 저장소의 스크립트

| 일 | 스크립트 | 토큰 |
| --- | --- | --- |
| 아침 리포트 | `morning-report.sh` (`build_report.py`, `notify.sh` 사용) | 0 |
| 매일 데이터 수집 | `collect-menu.sh` | 0 |
| 매일 SNS 1개 게시 | `post-daily.sh` | 0 |

- 전부 기본값이 안전하게 돌아갑니다. `notify.sh`는 `DRY_RUN=1`이 기본이고, `collect-menu.sh`는 `MOCK=1`이 기본이며, `post-daily.sh`는 `DRY_RUN=1`이 기본입니다.
- 실제로 보내려면 `.env`에 `DRY_RUN=0`을 적고 토큰을 채웁니다. 토큰은 `.env`에만 둡니다.

## launchd에 올리기

`examples/home/Library/LaunchAgents/com.example.today-menu.morning.plist`가 책의 plist입니다. 홈 폴더 안의 파일이라 `examples/home/` 아래에 복사본으로 둡니다.

1. 파일 안의 `/Users/내이름`을 내 계정 이름과 저장소 위치로 바꿉니다.
2. `~/Library/LaunchAgents/`에 복사합니다.
3. 아래 명령으로 올리고, 확인하고, 내립니다.

```bash
P=~/Library/LaunchAgents/com.example.today-menu.morning.plist
launchctl bootstrap gui/$(id -u) $P
launchctl list | grep today-menu
launchctl bootout gui/$(id -u)/com.example.today-menu.morning
```

- 처음 한 번은 시각을 지금부터 5분 뒤로 잡아 바로 도는지 봅니다.
- `Bootstrap failed`가 나면 plist 경로의 `내이름`을 먼저 확인합니다.
- plist 문법은 `plutil -lint 파일.plist`로 검사합니다.
- launchd는 내 터미널 설정을 읽지 않습니다. 스크립트가 `.env`를 직접 읽고(`notify.sh`가 합니다), 첫머리에서 `cd "$(dirname "$0")"` 합니다.
- 맥이 잠들어 있던 시간에 정각이 지나면 깨어난 뒤에 실행되는 경우가 많습니다. 꺼져 있던 하루는 건너뛰므로 빠진 날은 `data/`의 날짜 파일로 확인합니다.

## 클라우드 루틴으로 거는 법

```text
/schedule daily at 8am 어제 today-menu 방문 기록을 읽고 세 줄로 요약해 텔레그램으로 보내
```

- 크론 표현식은 UTC입니다. 한국 시간 아침 8시는 UTC 전날 23시입니다.
- 정각은 늦게 시작할 수 있으니 8시 7분처럼 피해 겁니다.
- 클라우드에는 로컬 `.env`가 없습니다. 비밀 값은 network secrets에 저장합니다.
- `/schedule`은 claude.ai 구독 계정으로 로그인한 상태에서만 보입니다. 로그인은 사람이 직접 합니다.

## 사람 몫

- 수집할 사이트의 이용약관과 `robots.txt`를 읽고 자동 수집이 되는지 정하는 일
- SNS 계정 로그인과 본인인증
- 텔레그램 봇 만들기(40장)
- 알림이 폰에 실제로 오는지 확인하는 일

## 수집 스크립트의 안전장치

- 요청 사이에 2초 쉽니다(`SLEEP_SECS`).
- 연속 3번 실패하면 멈추고 알립니다(`MAX_FAILS`).
- 하루 요청은 20번을 넘지 않습니다(`DAILY_LIMIT`). `robots.txt` 확인도 1번으로 셉니다.
- `robots.txt`에서 막힌 경로(`Disallow`)는 건드리지 않습니다.
- 받은 데이터는 `data/YYYY-MM-DD.json`에 저장합니다. 이 파일은 `.gitignore`에 있어 올라가지 않습니다.
- 경로 목록은 `config/collect-paths.txt`에 있고, 이 저장소의 예시는 가상의 파일입니다.

## 게시 스크립트의 안전장치

- 하루 1개: `posted.json`에 오늘 날짜가 있으면 바로 끝냅니다.
- 게시 전에 `[게시 확인 요청]`, 게시 후에 `[업로드 완료]` 알림을 보냅니다.
- 막고 싶으면 `posts/HOLD` 파일을 만듭니다.
- 실패하면 최대 2번 더 시도하고, 그다음은 알림만 보내고 멈춥니다.
- `POST_CMD`에는 공식 API로 올리는 명령을 넣습니다. 이 저장소에는 실제 게시 명령이 들어 있지 않습니다.
