#!/bin/bash
# check-srt-timing.sh [원본.srt] [고친.srt] : 시간 줄이 한 글자도 안 바뀌었는지 검사한다 (46.6)
set -u
A="${1:-out/sample.srt}"
B="${2:-out/sample.fixed.srt}"
[ -f "$A" ] && [ -f "$B" ] || { echo "멈춤: 파일이 없습니다: $A, $B" >&2; exit 2; }
if diff <(grep -- '-->' "$A") <(grep -- '-->' "$B") >/dev/null; then
  echo "시간표 동일 ($(grep -c -- '-->' "$A")개)"
else
  echo "시간표가 다릅니다. 시간 줄을 건드렸는지 확인하세요." >&2
  exit 1
fi
