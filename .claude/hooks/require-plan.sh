#!/bin/bash
# 선택 예제(settings에 연결하지 않음): PLAN.md에 사람이 쓴 "승인: 예" 줄이 있을 때만 Edit/Write를 통과시킨다.
# 쓰려면 .claude/settings.json 의 PreToolUse(matcher: Edit|Write)에 이 스크립트를 건다.
[ "$SKIP_HARNESS" = "1" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 2
cat >/dev/null

if [ -f PLAN.md ] && grep -q '^승인: 예' PLAN.md; then
  exit 0
fi

echo "먼저 PLAN.md에 계획을 쓰고 사람에게 승인받아. '승인: 예' 줄은 네가 쓰지 마." >&2
exit 2
