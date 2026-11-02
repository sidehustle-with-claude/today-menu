#!/bin/bash
# Stop 훅: 클로드가 답을 끝내면 폰으로 "작업 끝"을 알린다 (40.5)
# 어떤 경우에도 종료 코드 0. Stop 훅이 2로 끝나면 클로드가 멈추지 못하기 때문이다.
trap 'exit 0' EXIT

HERE="$(cd "$(dirname "$0")/.." && pwd)"
INPUT="$(cat)"

LINE=""
if [ "${NOTIFY_STOP_BODY:-1}" = "1" ] && command -v jq >/dev/null 2>&1; then
  # 마지막 답의 첫 줄만, 80자까지만 보낸다 (내용이 새거나 길어지는 것을 막음)
  LINE="$(printf '%s' "$INPUT" | jq -r '.last_assistant_message // empty' 2>/dev/null \
    | sed -n '/[^[:space:]]/{p;q;}' | cut -c1-80)"
fi

if [ -n "$LINE" ]; then
  "$HERE/notify.sh" "작업 끝" "$LINE"
else
  "$HERE/notify.sh" "작업 끝"
fi
exit 0
