#!/bin/bash
# 47장 스크립트 시험: ffmpeg 로 가짜 영상·음악을 만들어 실제로 돌려 본다. 임시 폴더에서만 일한다.
# 사용: bash tests/scripts/ffmpeg.test.sh      (자막 입히기는 ffmpeg 에 libass 가 있을 때만 시험한다)
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
command -v ffmpeg >/dev/null 2>&1 || { echo "건너뜀: ffmpeg 없음"; exit 0; }
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
cd "$T" || exit 1; mkdir -p video audio output; cp -R "$ROOT/images" images
fail=0; check() { if [ "$2" = "$3" ]; then echo "통과: $1"; else echo "실패: $1 (기대 $2, 실제 $3)"; fail=1; fi; }
q() { ffmpeg -hide_banner -loglevel error -n "$@"; }
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1" | awk '{printf "%d", $1+0.5}'; }
size() { ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$1"; }

q -f lavfi -i "testsrc2=s=640x360:r=25:d=20" -f lavfi -i "sine=frequency=300:d=20" -c:v libx264 -preset ultrafast -c:a aac -shortest video/input.mp4
q -f lavfi -i "sine=frequency=1000:d=8" -c:a libmp3lame audio/bgm.mp3
before="$(md5 -q video/input.mp4 2>/dev/null || md5sum video/input.mp4 | cut -d' ' -f1)"

bash "$ROOT/scripts/cut.sh" video/input.mp4 5 15 output/cut.mp4 >/dev/null; check "cut: 10초" 10 "$(dur output/cut.mp4)"
bash "$ROOT/scripts/cut.sh" video/input.mp4 5 15 output/cut.mp4 >/dev/null 2>&1; check "cut: 같은 이름이면 거부" 1 $?
bash "$ROOT/scripts/cut.sh" video/input.mp4 5 15 video/other.mp4 >/dev/null 2>&1; check "cut: output/ 밖은 거부" 1 $?
bash "$ROOT/scripts/extract-audio.sh" video/input.mp4 output/voice.m4a >/dev/null
check "extract-audio: 영상 줄기 없음" "" "$(ffprobe -v error -select_streams v -show_entries stream=codec_type -of csv=p=0 output/voice.m4a)"
bash "$ROOT/scripts/shrink.sh" video/input.mp4 output/small.mp4 320 >/dev/null; check "shrink: 가로 320, 세로 짝수 180" "320x180" "$(size output/small.mp4)"
check "원본 입력 불변" "$before" "$(md5 -q video/input.mp4 2>/dev/null || md5sum video/input.mp4 | cut -d' ' -f1)"

PRESET=ultrafast bash "$ROOT/scripts/make-intro.sh" >/dev/null; check "intro 가로판 1920x1080" "1920x1080" "$(size output/intro-16x9.mp4)"
check "intro 세로판 1080x1920" "1080x1920" "$(size output/intro-9x16.mp4)"
check "intro 길이 18.5초 -> 19" 19 "$(dur output/intro-16x9.mp4)"
check "intro 소리 줄기 있음" audio "$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 output/intro-16x9.mp4)"
TAG=nobgm BGM=none PRESET=ultrafast bash "$ROOT/scripts/make-intro.sh" >/dev/null; check "음악 없으면 소리 없이 만듦" "" "$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 output/nobgm-16x9.mp4)"

bash "$ROOT/scripts/mix-bgm.sh" video/input.mp4 audio/bgm.mp3 output/mixed.mp4 >/dev/null; check "mix: 길이는 영상 기준 20초" 20 "$(dur output/mixed.mp4)"
DUCK=0 MUSIC_GAIN=-20 bash "$ROOT/scripts/mix-bgm.sh" video/input.mp4 audio/bgm.mp3 output/mixed2.mp4 >/dev/null; check "mix: 덕킹 끄고 -20dB" 20 "$(dur output/mixed2.mp4)"
# 음악이 들어갔는지: 1000Hz 음악이 -15dB 로 섞였으면 소리 크기가 목소리만 있을 때와 다르다
a="$(ffmpeg -hide_banner -i output/mixed.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume | awk '{print $5}')"
[ -n "$a" ] && echo "통과: mix 결과 평균 음량 측정됨 (${a}dB)" || { echo "실패: 음량 측정"; fail=1; }

DRY_RUN=1 bash "$ROOT/scripts/cut.sh" video/input.mp4 1 2 output/dry.mp4 | grep -q "ffmpeg -n"; check "DRY_RUN 은 명령만 보여 줌" 0 $?
[ ! -e output/dry.mp4 ] && echo "통과: DRY_RUN 은 파일을 만들지 않음" || { echo "실패: DRY_RUN 파일 생성"; fail=1; }

printf '1\n00:00:00,000 --> 00:00:03,000\n안녕\n' > t.srt
if ffmpeg -hide_banner -filters 2>/dev/null | grep -q ' subtitles '; then
  bash "$ROOT/scripts/burn-subtitles.sh" output/small.mp4 t.srt output/subbed.mp4 >/dev/null; check "burn-subtitles 결과 생성" 0 $?
else
  bash "$ROOT/scripts/burn-subtitles.sh" output/small.mp4 t.srt output/subbed.mp4 2>&1 | grep -q "subtitles 필터"; check "libass 없으면 안내하고 멈춤 (자막 입히기는 이 ffmpeg 로 시험 못 함)" 0 $?
fi
exit $fail
