#!/bin/bash
# split-audio.sh 긴소리파일 : 10분 단위로 잘라 audio/parts/ 에 둔다 (46.10). 원본은 지우지 않는다.
#   bash scripts/split-audio.sh audio/long.m4a
# SEGMENT_SECONDS=600 (기본). 이미 같은 이름이 있으면 덮어쓰지 않고 멈춘다 (ffmpeg -n).
set -u
INPUT="${1:-}"
SEGMENT_SECONDS="${SEGMENT_SECONDS:-600}"
PARTS_DIR="${PARTS_DIR:-audio/parts}"
[ -f "$INPUT" ] || { echo "사용법: bash scripts/split-audio.sh audio/long.m4a" >&2; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "멈춤: ffmpeg 가 없습니다 (brew install ffmpeg)" >&2; exit 1; }
ext="${INPUT##*.}"
mkdir -p "$PARTS_DIR"
if ls "$PARTS_DIR"/part-*."$ext" >/dev/null 2>&1; then
  echo "멈춤: $PARTS_DIR 에 이미 part-*.$ext 가 있습니다. 덮어쓰지 않았습니다." >&2
  exit 1
fi
cmd=(ffmpeg -n -i "$INPUT" -f segment -segment_time "$SEGMENT_SECONDS" -c copy "$PARTS_DIR/part-%03d.$ext")
echo "실행: ${cmd[*]}"
"${cmd[@]}" -loglevel error
echo "만든 조각: $(ls "$PARTS_DIR"/part-*."$ext" | wc -l | tr -d ' ')개 ($PARTS_DIR)"
