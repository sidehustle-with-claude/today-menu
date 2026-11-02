#!/bin/bash
# shrink.sh 입력 출력 [가로픽셀=1280] : 가로를 줄이고 세로는 비율에 맞춰 짝수로 (47.4)
#   bash scripts/shrink.sh video/input.mp4 output/small.mp4
. "$(dirname "$0")/lib-ffmpeg.sh"
IN="${1:-}"; OUT="${2:-}"; WIDTH="${3:-1280}"
[ -n "$OUT" ] || die "사용법: bash scripts/shrink.sh video/input.mp4 output/small.mp4 [1280]"
need_tools; need_input "$IN"; need_new_output "$OUT"
run_ffmpeg -i "$IN" -vf "scale=${WIDTH}:-2" -c:v libx264 -crf 23 -c:a aac "$OUT"
probe "$OUT"
