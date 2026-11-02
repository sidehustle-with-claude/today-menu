#!/bin/bash
# 46장 스크립트 시험: 가짜 whisper 로 흐름만 확인하고, ffmpeg 가 있으면 실제 분할도 해 본다.
# 사용: bash tests/scripts/transcribe.test.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/audio"; cd "$T" || exit 1
fail=0; check() { if [ "$2" = "$3" ]; then echo "통과: $1"; else echo "실패: $1 (기대 $2, 실제 $3)"; fail=1; fi; }

bash "$ROOT/scripts/transcribe.sh" >/dev/null 2>&1; check "소리 파일이 없으면 멈춤" 1 $?
: > audio/sample.m4a
PATH="/usr/bin:/bin" bash "$ROOT/scripts/transcribe.sh" >/dev/null 2>&1; check "whisper 가 없으면 안내하고 멈춤" 1 $?
printf '#!/bin/bash\necho "FAKE whisper $*" >> "$T/whisper.log"\nexit 0\n' > bin/whisper
chmod +x bin/whisper
export T PATH="$T/bin:$PATH"
DRY_RUN=1 bash "$ROOT/scripts/transcribe.sh" audio/sample.m4a medium >/dev/null; check "DRY_RUN 은 실행하지 않음" 0 "$([ -f whisper.log ] && wc -l < whisper.log | tr -d ' ' || echo 0)"
bash "$ROOT/scripts/transcribe.sh" audio/sample.m4a medium >/dev/null; check "실행 시 whisper 호출" 1 "$(grep -c -- '--model medium --language Korean --output_format srt' whisper.log)"
MODELS="tiny base" bash "$ROOT/scripts/bench-models.sh" audio/sample.m4a >/dev/null 2>&1; check "bench 가 모델별 .time 을 만듦" 2 "$(ls out/*.time 2>/dev/null | wc -l | tr -d ' ')"

bash "$ROOT/scripts/check-srt-timing.sh" "$ROOT/out/sample.srt" "$ROOT/out/sample.fixed.srt" | grep -q "시간표 동일"; check "예시 자막 시간표 동일" 0 $?
sed 's/00:00:03,500 --> 00:00:08,000/00:00:03,600 --> 00:00:08,000/' "$ROOT/out/sample.fixed.srt" > bad.srt
bash "$ROOT/scripts/check-srt-timing.sh" "$ROOT/out/sample.srt" bad.srt >/dev/null 2>&1; check "시간이 바뀌면 거부" 1 $?

if command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -loglevel error -f lavfi -i "sine=frequency=440:duration=25" -c:a aac audio/long.m4a
  SEGMENT_SECONDS=10 bash "$ROOT/scripts/split-audio.sh" audio/long.m4a >/dev/null 2>&1; check "25초를 10초 단위로 3조각" 3 "$(ls audio/parts | wc -l | tr -d ' ')"
  check "원본 유지" 1 "$([ -f audio/long.m4a ] && echo 1 || echo 0)"
  SEGMENT_SECONDS=10 bash "$ROOT/scripts/split-audio.sh" audio/long.m4a >/dev/null 2>&1; check "이미 조각이 있으면 거부" 1 $?
else
  echo "건너뜀: ffmpeg 없음"
fi
exit $fail
