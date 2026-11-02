#!/bin/bash
# burn-subtitles.sh 입력영상 자막.srt 출력 : 자막을 화면에 박아 넣기 (47.5)
#   bash scripts/burn-subtitles.sh output/small.mp4 out/sample.fixed.srt output/subbed.mp4
# 글꼴 이름이 맞지 않으면 네모 글자로 깨진다. 기본은 맥에 들어 있는 Apple SD Gothic Neo.
# 글꼴 확인: fc-list | grep -i "Apple SD"     글자 크기: FONT_SIZE=22 (기본)
. "$(dirname "$0")/lib-ffmpeg.sh"
IN="${1:-}"; SRT="${2:-}"; OUT="${3:-}"
FONT_NAME="${FONT_NAME:-Apple SD Gothic Neo}"
FONT_SIZE="${FONT_SIZE:-22}"
[ -n "$OUT" ] || die "사용법: bash scripts/burn-subtitles.sh output/small.mp4 out/sample.fixed.srt output/subbed.mp4"
need_tools; need_input "$IN"; need_input "$SRT"; need_new_output "$OUT"
if ! ffmpeg -hide_banner -filters 2>/dev/null | grep -q ' subtitles '; then
  die "이 ffmpeg 에는 subtitles 필터(libass)가 없습니다. brew 로 설치한 ffmpeg 인지 'which ffmpeg' 로 확인하세요."
fi
run_ffmpeg -i "$IN" \
  -vf "subtitles=${SRT}:force_style='FontName=${FONT_NAME},FontSize=${FONT_SIZE}'" \
  -c:a copy "$OUT"
probe "$OUT"
