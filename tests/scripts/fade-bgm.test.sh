#!/bin/bash
# 48장 시험: 사인파로 25초 곡을 만들어 fade-bgm.sh 가 20초로 자르고 끝을 줄이는지 확인한다.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
command -v ffmpeg >/dev/null 2>&1 || { echo "건너뜀: ffmpeg 없음"; exit 0; }
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT; cd "$T" || exit 1; mkdir audio
fail=0; check() { if [ "$2" = "$3" ]; then echo "통과: $1"; else echo "실패: $1 (기대 $2, 실제 $3)"; fail=1; fi; }
bash "$ROOT/scripts/fade-bgm.sh" >/dev/null 2>&1; check "원본이 없으면 멈춤" 1 $?
ffmpeg -hide_banner -loglevel error -n -f lavfi -i "sine=frequency=440:duration=25" -c:a libmp3lame audio/bgm-raw.mp3
sum="$(md5 -q audio/bgm-raw.mp3 2>/dev/null || md5sum audio/bgm-raw.mp3 | cut -d' ' -f1)"
bash "$ROOT/scripts/fade-bgm.sh" >/dev/null; check "실행 성공" 0 $?
d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 audio/bgm.mp3 | awk '{printf "%d", $1+0.5}')"; check "길이 20초" 20 "$d"
# 끝 1초 구간이 시작 후 5초 구간보다 훨씬 조용해야 한다
vol() { ffmpeg -hide_banner -ss "$1" -t 0.5 -i audio/bgm.mp3 -af volumedetect -f null - 2>&1 | awk '/mean_volume/{print int($5)}'; }
mid="$(vol 5)"; end="$(vol 19.5)"
[ "$end" -lt "$((mid - 10))" ] && echo "통과: 끝이 중간보다 10dB 이상 작음 (중간 ${mid}dB, 끝 ${end}dB)" || { echo "실패: 페이드 아웃 (중간 ${mid}dB, 끝 ${end}dB)"; fail=1; }
check "원본 불변" "$sum" "$(md5 -q audio/bgm-raw.mp3 2>/dev/null || md5sum audio/bgm-raw.mp3 | cut -d' ' -f1)"
bash "$ROOT/scripts/fade-bgm.sh" >/dev/null 2>&1; check "출력이 있으면 덮어쓰지 않음" 1 $?
exit $fail
