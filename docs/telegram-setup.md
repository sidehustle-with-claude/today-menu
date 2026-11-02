# 텔레그램 알림과 지시 설정

40장에서 만든 것을 한 장으로 정리한 문서입니다.

## 알림만 보내기 (컴퓨터에서 폰으로)

- `.env.example` 을 `.env` 로 복사하고 토큰과 chat id 를 사람이 직접 붙여 넣습니다.
- `.env` 는 `.gitignore` 에 들어 있습니다. 토큰을 깃에 올리지 마세요.
- `DRY_RUN=1` 이 기본값입니다. 이때 `notify.sh` 는 보낼 글만 화면에 보여 주고 실제로 보내지 않습니다.
- 폰에 정말 오는지 확인할 때만 `.env` 에서 `DRY_RUN=0` 으로 바꿉니다.

```bash
./notify.sh "배포 끝" "오늘 뭐 먹지 웹이 올라갔습니다" "주소는 열어서 확인하세요"
```

- 제목 한 줄, 그 아래 `- ` 줄 형식으로 갑니다.
- 토큰이나 chat id 가 비어 있으면 아무것도 보내지 않고 끝납니다.
- 알림 스크립트는 늘 종료 코드 0 으로 끝납니다.

## chat id 찾기

- 폰에서 내 봇에게 먼저 아무 말이나 보냅니다.
- `getUpdates` 결과에서 `message` 안 `chat` 아래 `id` 숫자를 찾습니다.
- 토큰이 든 명령줄은 남에게 붙여 넣지 말고 결과만 보여 주세요.

## 훅으로 자동 알림

`.claude/settings.json` 에 두 훅이 걸려 있습니다.

- `Stop`: `scripts/notify-stop.sh` 가 "작업 끝"과 마지막 답의 첫 줄(80자까지)을 보냅니다.
- `Notification` (`permission_prompt`): `scripts/notify-ask.sh` 가 "허락 기다리는 중"을 보냅니다.
- 마지막 답을 보내고 싶지 않으면 `NOTIFY_STOP_BODY=0` 으로 실행하면 "작업 끝"만 갑니다.
- 두 스크립트 모두 어떤 경우에도 종료 코드 0 입니다.

## 폰에서 지시하기 (channels)

channels 는 연구 미리보기라서 명령 이름이 바뀔 수 있습니다. 책 40.6 과 공식 문서를 먼저 확인하세요.

```text
/plugin install telegram@claude-plugins-official
/telegram:configure 123456:ABC-여기에-토큰
```

```bash
claude --channels plugin:telegram@claude-plugins-official
```

```text
/telegram:access pair 여기에-코드
/telegram:access policy allowlist
```

- 알림 봇과 지시용 봇은 다른 봇으로 만드는 편이 헷갈리지 않습니다.
- `policy allowlist` 로 내 계정만 보낼 수 있게 잠그는 단계를 빼먹지 마세요.
- 짝짓기 코드를 터미널에 입력하는 일은 사람이 합니다.
- `--dangerously-skip-permissions` 는 폰으로 시킬 때 켜지 않습니다.
