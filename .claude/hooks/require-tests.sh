#!/bin/bash
# 예제 51-1: 테스트가 통과해야 멈출 수 있는 Stop 훅
# (맥 기본 bash는 $변수 뒤 한글을 변수명으로 읽어서 ${MAX_FAILS} 로 감싼다.)
# 탈출구: 사람이 터미널에서 SKIP_HARNESS=1 을 켜면 바로 통과한다.
[ "$SKIP_HARNESS" = "1" ] && exit 0

# 프로젝트 폴더에서 돌린다. 못 가면 막는 쪽(2)으로 끝낸다.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 2

COUNT_FILE=".claude/hooks/.fail-count"
MAX_FAILS="${MAX_FAILS:-3}"
LOG_FILE="${TMPDIR:-/tmp}/today-menu-test.log"

input=$(cat)

if npm test >"$LOG_FILE" 2>&1; then
  rm -f "$COUNT_FILE"
  exit 0
fi

count=$(cat "$COUNT_FILE" 2>/dev/null || echo 0)
count=$((count + 1)) || exit 2
echo "$count" > "$COUNT_FILE" || exit 2

if [ "$count" -ge "$MAX_FAILS" ]; then
  rm -f "$COUNT_FILE"
  echo "테스트가 ${MAX_FAILS}번 연속 실패해 사람에게 넘깁니다." >&2
  tail -n 20 "$LOG_FILE" >&2
  exit 0
fi

echo "테스트 실패. 고친 뒤 다시 끝내세요:" >&2
tail -n 20 "$LOG_FILE" >&2
exit 2
