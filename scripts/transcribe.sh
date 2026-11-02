#!/bin/bash
# transcribe.sh [소리파일] [모델] : Whisper 로 받아쓰기해서 SRT 자막을 out/ 에 만든다 (46.3, 46.4)
#   bash scripts/transcribe.sh                          # audio/sample.m4a, small
#   bash scripts/transcribe.sh audio/sample.m4a medium
# 처음 한 번은 모델 파일을 내려받느라 시간이 걸린다. DRY_RUN=1 이면 실행할 명령만 보여 준다.

set -u
INPUT="${1:-audio/sample.m4a}"
MODEL="${2:-small}"
OUT_DIR="${OUT_DIR:-out}"
DRY_RUN="${DRY_RUN:-0}"

[ -f "$INPUT" ] || { echo "멈춤: 소리 파일이 없습니다: $INPUT" >&2; exit 1; }
if ! command -v whisper >/dev/null 2>&1; then
  echo "멈춤: whisper 가 없습니다. 설치: brew install ffmpeg && pip install -U openai-whisper (가상환경 권장)" >&2
  exit 1
fi
cmd=(whisper "$INPUT" --model "$MODEL" --language Korean --output_format srt --output_dir "$OUT_DIR")
echo "실행: ${cmd[*]}"
[ "$DRY_RUN" = "1" ] && exit 0
mkdir -p "$OUT_DIR"
"${cmd[@]}"
