#!/bin/bash
# fade-bgm.sh : Suno 에서 받은 곡을 20초로 자르고 시작은 서서히 키우고 끝 2초는 서서히 줄인다 (48.4)
#   bash scripts/fade-bgm.sh                              # audio/bgm-raw.mp3 -> audio/bgm.mp3
#   bash scripts/fade-bgm.sh 입력.mp3 출력.mp3
# 원본(bgm-raw.mp3)은 지우거나 고치지 않는다. 같은 이름의 출력이 있으면 덮어쓰지 않고 멈춘다 (-n).
# 길이를 바꾸려면 SECONDS_TOTAL=30 처럼 쓴다. 끝 서서히 줄이기는 항상 마지막 2초다.
set -u
IN="${1:-audio/bgm-raw.mp3}"
OUT="${2:-audio/bgm.mp3}"
TOTAL="${SECONDS_TOTAL:-20}"
FADE_OUT_START="$(awk -v t="$TOTAL" 'BEGIN{printf "%g", t-2}')"
DRY_RUN="${DRY_RUN:-0}"

die() { echo "멈춤: $*" >&2; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg 가 없습니다 (brew install ffmpeg)"
[ -f "$IN" ] || die "입력 파일이 없습니다: $IN (Suno 에서 내려받아 이 이름으로 두세요)"
[ ! -e "$OUT" ] || die "이미 있는 파일입니다. 덮어쓰지 않았습니다: $OUT"

cmd=(ffmpeg -hide_banner -loglevel error -n -i "$IN" -t "$TOTAL" -af "afade=t=in:st=0:d=0.5,afade=t=out:st=${FADE_OUT_START}:d=2" "$OUT")
echo "실행: ${cmd[*]}"
[ "$DRY_RUN" = "1" ] && exit 0
"${cmd[@]}" || die "ffmpeg 가 실패했습니다"
dur="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT" 2>/dev/null)"
echo "확인: $OUT 길이 ${dur:-?}초"
