#!/bin/bash
# bench-models.sh [소리파일] : 모델 크기별로 같은 파일을 받아쓰고 걸린 시간을 표로 모은다 (46.5)
# 결과: out/<모델>/ 에 자막, out/<모델>.time 에 시간. 내 맥, 내 목소리에서 잰 값만 믿는다.
# MODELS="tiny base" 처럼 줄일 수 있다.

set -u
INPUT="${1:-audio/sample.m4a}"
MODELS="${MODELS:-tiny base small medium turbo}"

[ -f "$INPUT" ] || { echo "멈춤: 소리 파일이 없습니다: $INPUT" >&2; exit 1; }
command -v whisper >/dev/null 2>&1 || { echo "멈춤: whisper 가 없습니다 (scripts/transcribe.sh 안내 참고)" >&2; exit 1; }
mkdir -p out

for m in $MODELS; do
  echo "== $m"
  /usr/bin/time -p whisper "$INPUT" --model "$m" \
    --language Korean --output_dir "out/$m" 2> "out/$m.time"
done

echo
echo "모델 | 걸린 시간(초)"
echo "---|---"
for m in $MODELS; do
  sec="$(awk '$1=="real"{print $2}' "out/$m.time" 2>/dev/null)"
  echo "$m | ${sec:-측정 실패}"
done
echo
echo "틀린 글자 수는 audio/script.txt 원문과 out/<모델>/ 결과를 비교해 직접 적습니다."
