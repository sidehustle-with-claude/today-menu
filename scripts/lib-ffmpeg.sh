#!/bin/bash
# lib-ffmpeg.sh : ffmpeg 스크립트들이 같이 쓰는 안전 규칙 (47장). 직접 실행하지 않고 source 한다.
#
# 규칙
#   (1) 입력 파일은 수정하지 않는다. 읽기만 한다.
#   (2) 출력은 output/ 폴더에 새 이름으로 저장한다.
#   (3) 덮어쓰기 방지로 ffmpeg 에 -n 을 붙인다. 이미 있는 파일 이름이면 멈춘다.
#   (4) 실행 전에 명령을 먼저 보여 준다.
#   (5) 끝나면 ffprobe 로 길이, 해상도, 코덱을 보여 준다.
# DRY_RUN=1 이면 명령만 보여 주고 실행하지 않는다.

OUTPUT_DIR="${OUTPUT_DIR:-output}"
DRY_RUN="${DRY_RUN:-0}"

die() { echo "멈춤: $*" >&2; exit 1; }

need_tools() {
  command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg 가 없습니다 (brew install ffmpeg)"
  command -v ffprobe >/dev/null 2>&1 || die "ffprobe 가 없습니다 (ffmpeg 와 같이 설치됩니다)"
}

# 입력 파일이 있는지 확인
need_input() {
  [ -f "$1" ] || die "입력 파일이 없습니다: $1"
}

# 출력은 output/ 안의 새 이름이어야 한다
need_new_output() {
  case "$1" in
    "$OUTPUT_DIR"/*) ;;
    *) die "출력은 $OUTPUT_DIR/ 폴더에 저장해야 합니다: $1" ;;
  esac
  [ ! -e "$1" ] || die "이미 있는 파일입니다. 덮어쓰지 않았습니다: $1 (다른 이름을 쓰세요)"
  mkdir -p "$(dirname "$1")"
}

# ffmpeg -n 으로 실행. 먼저 명령을 보여 준다
run_ffmpeg() {
  echo "실행: ffmpeg -n $*"
  [ "$DRY_RUN" = "1" ] && return 0
  ffmpeg -hide_banner -loglevel error -n "$@" || die "ffmpeg 가 실패했습니다"
}

# 결과 확인: 길이, 해상도, 코덱
probe() {
  [ "$DRY_RUN" = "1" ] && return 0
  [ -f "$1" ] || die "결과 파일이 만들어지지 않았습니다: $1"
  echo "확인: $1"
  ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height \
    -of default=noprint_wrappers=1 "$1" | sed 's/^/  /'
}
