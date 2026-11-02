#!/bin/bash
# PreToolUse 훅: 하네스(훅 스크립트, 설정 파일)를 Edit/Write로 고치려 하면 막는다.
# 탈출구: 사람이 터미널에서 SKIP_HARNESS=1 을 켠다.
[ "$SKIP_HARNESS" = "1" ] && exit 0

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty') || exit 2

case "$FILE_PATH" in
  *.claude/hooks/*|*.claude/settings.json|*.claude/settings.local.json)
    echo "차단: $FILE_PATH 는 하네스 파일입니다. 고치지 말고 막힌 이유를 사람에게 보고하세요." >&2
    exit 2
    ;;
esac
exit 0
