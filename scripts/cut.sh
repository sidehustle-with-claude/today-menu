#!/bin/bash
# cut.sh 입력 시작초 끝초 출력 : 영상의 일부만 잘라 저장 (47.4)
#   bash scripts/cut.sh video/input.mp4 5 15 output/cut.mp4
. "$(dirname "$0")/lib-ffmpeg.sh"
IN="${1:-}"; START="${2:-}"; END="${3:-}"; OUT="${4:-}"
[ -n "$OUT" ] || die "사용법: bash scripts/cut.sh video/input.mp4 5 15 output/cut.mp4"
need_tools; need_input "$IN"; need_new_output "$OUT"
run_ffmpeg -ss "$START" -to "$END" -i "$IN" -c:v libx264 -c:a aac "$OUT"
probe "$OUT"
