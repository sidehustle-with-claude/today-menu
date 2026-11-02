#!/bin/bash
# revive-sessions.sh : 맥이 재부팅되고 로그인한 뒤, 프로젝트별 Remote Control 세션을 다시 켠다 (41.4)
# 실제 위치는 ~/bin/revive-sessions.sh 이고, 이 파일은 저장소에 둔 복사본이다.
#
# 등록 파일(PROJECTS_FILE)은 한 줄에 "폴더경로|세션이름" 하나. # 로 시작하면 주석.
#   ~/projects/today-menu|today-menu
#
# DRY_RUN=1 (기본값): 실행할 명령만 보여 주고 아무것도 켜지 않는다.
# 실제로 켜려면 DRY_RUN=0 으로 실행한다.
#
# 사람 몫: 폴더 믿음 확인(Trust)은 터미널에서 한 번 직접 열어 저장해 둬야 한다.
# 이 스크립트는 그 단계를 대신하지 않고, 막히면 폰으로 "수동 확인 필요"를 알린다.

DRY_RUN="${DRY_RUN:-1}"
PROJECTS_FILE="${PROJECTS_FILE:-$HOME/.config/today-menu/projects.txt}"
NOTIFY_SH="${NOTIFY_SH:-$HOME/projects/today-menu/notify.sh}"
LOG_DIR="${LOG_DIR:-$HOME/.local/state/today-menu}"
WAIT_SECONDS="${WAIT_SECONDS:-8}"
# 40장 텔레그램 세션 (비워 두면 건드리지 않음). 터미널이 필요해 tmux 안에서 켠다.
TELEGRAM_DIR="${TELEGRAM_DIR:-}"

started=0
manual=()

notify() {
  if [ -x "$NOTIFY_SH" ]; then
    "$NOTIFY_SH" "$@" || true
  else
    echo "알림 스크립트가 없어 화면에만 씁니다: $*"
  fi
}

run() {
  if [ "$DRY_RUN" != "0" ]; then
    echo "[DRY_RUN] $*"
    return 0
  fi
  "$@"
}

if [ ! -f "$PROJECTS_FILE" ]; then
  echo "등록 파일이 없습니다: $PROJECTS_FILE" >&2
  notify "재부팅 뒤 세션 확인" "등록 파일이 없어 아무것도 켜지 않았습니다"
  exit 0
fi

mkdir -p "$LOG_DIR"

while IFS='|' read -r dir name; do
  case "$dir" in ''|'#'*) continue ;; esac
  dir="${dir/#\~/$HOME}"
  name="${name:-$(basename "$dir")}"
  if [ ! -d "$dir" ]; then
    manual+=("$name (폴더 없음)")
    continue
  fi
  log="$LOG_DIR/$name.log"
  # -c 는 이 폴더에서 마지막 서버가 시작한 세션을 되살린다 (Claude Code 2.1.200 이상)
  cmd=(caffeinate -i claude remote-control --name "$name" -c)
  if [ "$DRY_RUN" != "0" ]; then
    echo "[DRY_RUN] (cd $dir && ${cmd[*]})"
    started=$((started + 1))
    continue
  fi
  (cd "$dir" && nohup "${cmd[@]}" >"$log" 2>&1 &)
  sleep "$WAIT_SECONDS"
  if grep -q "Workspace not trusted" "$log" 2>/dev/null; then
    manual+=("$name")
  else
    started=$((started + 1))
  fi
done < "$PROJECTS_FILE"

if [ -n "$TELEGRAM_DIR" ]; then
  if command -v tmux >/dev/null 2>&1; then
    run tmux new-session -d -s today-menu-telegram -c "$TELEGRAM_DIR" \
      "claude --channels plugin:telegram@claude-plugins-official" \
      && started=$((started + 1))
  else
    manual+=("텔레그램 세션 (tmux 없음)")
  fi
fi

for m in "${manual[@]}"; do
  notify "수동 확인 필요" "$m"
done
notify "재부팅 뒤 세션 ${started}개 켜짐"
exit 0
