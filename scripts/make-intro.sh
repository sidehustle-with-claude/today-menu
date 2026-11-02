#!/bin/bash
# make-intro.sh : images/1.png ~ 4.png 로 소개 영상 두 판을 만든다 (47.6)
#   bash scripts/make-intro.sh                  # audio/bgm.mp3 가 있으면 깐다
#   BGM=audio/bgm.mp3 bash scripts/make-intro.sh
# 결과: output/intro-16x9.mp4 (1920x1080), output/intro-9x16.mp4 (1080x1920)
# - 사진은 늘이지 않는다. 비율이 안 맞으면 같은 사진을 흐리게 키워 배경으로 깐다.
# - 사진 한 장은 SEC 초(기본 5), 장면 사이는 FADE 초(기본 0.5) 동안 서서히 겹친다.
# - 음악은 영상 길이에 맞춰 자르고 끝 2초는 서서히 줄인다. 음악 파일이 없으면 소리 없이 만든다.
. "$(dirname "$0")/lib-ffmpeg.sh"
IMAGES=("${IMAGES_DIR:-images}"/1.png "${IMAGES_DIR:-images}"/2.png "${IMAGES_DIR:-images}"/3.png "${IMAGES_DIR:-images}"/4.png)
BGM="${BGM:-audio/bgm.mp3}"
SEC="${SEC:-5}"
FADE="${FADE:-0.5}"
PRESET="${PRESET:-veryfast}"
TAG="${TAG:-intro}"

need_tools
for f in "${IMAGES[@]}"; do need_input "$f"; done
N=${#IMAGES[@]}
TOTAL="$(awk -v n="$N" -v s="$SEC" -v f="$FADE" 'BEGIN{printf "%.2f", n*s-(n-1)*f}')"
FADE_START="$(awk -v t="$TOTAL" 'BEGIN{printf "%.2f", t-2}')"

make_one() {
  local W="$1" H="$2" OUT="$3"
  need_new_output "$OUT"
  local inputs=() filter="" i
  for ((i = 0; i < N; i++)); do
    inputs+=(-loop 1 -framerate 30 -t "$SEC" -i "${IMAGES[$i]}")
    filter+="[$i:v]split[a$i][b$i];"
    filter+="[a$i]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=25:5[bg$i];"
    filter+="[b$i]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg$i];"
    filter+="[bg$i][fg$i]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30,format=yuv420p[v$i];"
  done
  local last="v0" offset
  for ((i = 1; i < N; i++)); do
    offset="$(awk -v i="$i" -v s="$SEC" -v f="$FADE" 'BEGIN{printf "%.2f", i*(s-f)}')"
    filter+="[${last}][v$i]xfade=transition=fade:duration=${FADE}:offset=${offset}[x$i];"
    last="x$i"
  done
  filter="${filter%;}"
  if [ -f "$BGM" ]; then
    run_ffmpeg "${inputs[@]}" -i "$BGM" \
      -filter_complex "${filter};[${N}:a]atrim=0:${TOTAL},afade=t=out:st=${FADE_START}:d=2[aout]" \
      -map "[${last}]" -map "[aout]" -t "$TOTAL" -c:v libx264 -preset "$PRESET" -c:a aac "$OUT"
  else
    echo "알림: $BGM 이 없어 소리 없이 만듭니다."
    run_ffmpeg "${inputs[@]}" -filter_complex "$filter" \
      -map "[${last}]" -t "$TOTAL" -c:v libx264 -preset "$PRESET" -an "$OUT"
  fi
  probe "$OUT"
}

make_one 1920 1080 "$OUTPUT_DIR/${TAG}-16x9.mp4"
make_one 1080 1920 "$OUTPUT_DIR/${TAG}-9x16.mp4"
