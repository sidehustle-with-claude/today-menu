#!/bin/bash
# extract-audio.sh 입력영상 출력.m4a : 소리만 뽑기, 영상은 뺀다 (47.4)
#   bash scripts/extract-audio.sh video/input.mp4 output/voice.m4a
. "$(dirname "$0")/lib-ffmpeg.sh"
IN="${1:-}"; OUT="${2:-}"
[ -n "$OUT" ] || die "사용법: bash scripts/extract-audio.sh video/input.mp4 output/voice.m4a"
need_tools; need_input "$IN"; need_new_output "$OUT"
run_ffmpeg -i "$IN" -vn -c:a aac "$OUT"
probe "$OUT"
