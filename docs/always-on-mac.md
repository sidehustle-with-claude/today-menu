# 컴퓨터를 켜 두고 폰으로 조종하기

41장에서 정리한 설정입니다. 맥을 상시 켜 두는 사람 기준입니다.

## 잠들지 않게

- 시스템 잠자기가 세션이 끊기는 주된 원인입니다. 화면 잠금은 프로그램을 멈추지 않습니다.
- 시스템 설정에서 자동 잠자기를 끄거나, 필요한 동안만 `caffeinate` 를 씁니다.

```bash
caffeinate -dimsu
caffeinate -i claude remote-control --name "today-menu"
```

- `-s` 는 전원 어댑터를 쓸 때만 효과가 있습니다. 상시 서버로 쓰면 전원을 꽂아 두세요.

## 정전 뒤 저절로 켜지게

사람이 터미널에서 직접 실행합니다. 관리자 암호를 클로드에게 알려 주거나 입력시키지 마세요.

```bash
sudo pmset -a autorestart 1
```

- 자동 로그인은 집 안 기기에서만 켭니다. 맥을 켜기만 하면 누구나 내 계정으로 들어갈 수 있게 됩니다.
- FileVault 가 켜져 있으면 자동 로그인 메뉴가 막힙니다. 그러면 정전 뒤 로그인은 사람이 합니다.

## 재부팅 뒤 세션 되살리기

- `examples/home/bin/revive-sessions.sh` 를 `~/bin/` 에 복사합니다.
- 등록 파일 `~/.config/today-menu/projects.txt` 에 `폴더경로|세션이름` 을 한 줄씩 적습니다.
- 각 폴더는 터미널에서 한 번 직접 열어 믿음(Trust)을 저장해 둡니다. 안 하면 `Workspace not trusted` 로 끝납니다.
- 스크립트는 기본이 DRY_RUN 입니다. 보여 주는 명령을 확인한 뒤 `DRY_RUN=0` 으로 실행합니다.
- launchd 설정 파일은 설치 전에 내용을 먼저 읽고, 설치와 불러오기는 내가 허락한 뒤에 합니다.

```bash
cp examples/home/Library/LaunchAgents/com.example.today-menu.revive.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.example.today-menu.revive.plist
```

## 보안 점검

- 채널 허용 목록은 나만 보낼 수 있게 잠급니다 (40장).
- claude.ai 계정에 2단계 인증을 켭니다.
- 폰에 화면 잠금을 겁니다.
- `--dangerously-skip-permissions` 는 켜지 않습니다.
- 쓰지 않는 세션은 닫습니다.
