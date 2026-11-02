#!/bin/bash
# Notification(permission_prompt) 훅: 클로드가 허락을 기다리면 폰으로 알린다 (40.5)
# 알림 훅은 종료 코드가 무시되지만, 습관대로 늘 0으로 끝낸다.
trap 'exit 0' EXIT

HERE="$(cd "$(dirname "$0")/.." && pwd)"
INPUT="$(cat)"

MSG=""
if command -v jq >/dev/null 2>&1; then
  MSG="$(printf '%s' "$INPUT" | jq -r '.message // empty' 2>/dev/null | head -n1 | cut -c1-80)"
fi

if [ -n "$MSG" ]; then
  "$HERE/notify.sh" "허락 기다리는 중" "$MSG"
else
  "$HERE/notify.sh" "허락 기다리는 중"
fi
exit 0
