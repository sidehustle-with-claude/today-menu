#!/bin/bash
# mix-bgm.sh 목소리영상 배경음악 출력 : 목소리 크기를 맞추고 음악을 작게 깔기 (47.7)
#   bash scripts/mix-bgm.sh video/voice.mp4 audio/bgm.mp3 output/mixed.mp4
# - 목소리: loudnorm 으로 크기를 일정하게 맞춘다.
# - 음악: MUSIC_GAIN dB 만큼 줄인다. 기본 -15dB 은 목소리의 약 18% 크기다. 내 귀로 정한다.
# - 목소리가 나올 때는 음악이 더 줄어든다(덕킹). DUCK=0 이면 끈다.
# - 음악이 영상보다 짧으면 반복한다. 영상 화면은 다시 인코딩하지 않고 그대로 복사한다.
. "$(dirname "$0")/lib-ffmpeg.sh"
VOICE="${1:-}"; BGM="${2:-}"; OUT="${3:-}"
MUSIC_GAIN="${MUSIC_GAIN:--15}"
DUCK="${DUCK:-1}"
[ -n "$OUT" ] || die "사용법: bash scripts/mix-bgm.sh video/voice.mp4 audio/bgm.mp3 output/mixed.mp4"
need_tools; need_input "$VOICE"; need_input "$BGM"; need_new_output "$OUT"
if [ "$DUCK" = "1" ]; then
  filter="[0:a]loudnorm=I=-16:TP=-1.5:LRA=11,asplit=2[voice][side];[1:a]volume=${MUSIC_GAIN}dB[bg];[bg][side]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];[voice][duck]amix=inputs=2:duration=first:normalize=0[aout]"
else
  filter="[0:a]loudnorm=I=-16:TP=-1.5:LRA=11[voice];[1:a]volume=${MUSIC_GAIN}dB[bg];[voice][bg]amix=inputs=2:duration=first:normalize=0[aout]"
fi
run_ffmpeg -i "$VOICE" -stream_loop -1 -i "$BGM" -filter_complex "$filter" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -shortest "$OUT"
probe "$OUT"
