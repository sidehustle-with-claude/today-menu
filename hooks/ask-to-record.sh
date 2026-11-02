#!/bin/bash
# ask-to-record.sh : Stop 훅. 세션마다 한 번만 "기록할 것이 있었나?" 하고 되묻는다.
# 두 번째부터는 그냥 통과(0)한다. 탈출구: SKIP_HARNESS=1
[ "$SKIP_HARNESS" = "1" ] && exit 0

INPUT="$(cat)"
SESSION="$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null | tr -cd 'A-Za-z0-9_-')"
# 세션 번호를 못 읽으면 되묻지 않는다(무한히 막는 쪽보다 안전하다).
[ -n "$SESSION" ] || exit 0

MARK="${TMPDIR:-/tmp}/wiki-asked-$SESSION"
[ -f "$MARK" ] && exit 0
touch "$MARK"
echo "이번 세션에서 새로 알게 된 사실이나 사용자가 정한 규칙이" >&2
echo "있으면 이 저장소의 knowledge/ 또는 decisions/ 에 기록하고 CATALOG.md 에 한 줄을 더한다." >&2
echo "없으면 '기록할 것 없음'이라고만 답한다." >&2
exit 2
