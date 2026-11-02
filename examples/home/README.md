# examples/home

내 홈 디렉터리(`~`) 안에 두는 파일의 복사본입니다. 저장소 안에서는 동작하지 않고, 필요한 것만 홈의 같은 위치로 복사해 씁니다.

- `bin/revive-sessions.sh` → `~/bin/revive-sessions.sh` (41장: 재부팅 뒤 세션 되살리기, 기본은 DRY_RUN)
- `Library/LaunchAgents/com.example.today-menu.revive.plist` → `~/Library/LaunchAgents/` (41장: 로그인 때 위 스크립트를 한 번 실행, `내이름`을 내 계정 이름으로 바꾼 뒤 설치)
- `Library/LaunchAgents/com.example.today-menu.morning.plist` → `~/Library/LaunchAgents/` (54장: 매일 8시에 `morning-report.sh` 실행, `내이름`을 내 계정 이름으로 바꾼 뒤 설치)
- `.claude/skills/telegram-report/` → `~/.claude/skills/telegram-report/` (55장: 제목 아래 `- 줄` 형식을 검사하고 텔레그램으로 보내는 스킬. 기본은 DRY_RUN, 새 폴더라 `/reload-skills`가 필요할 수 있음)
