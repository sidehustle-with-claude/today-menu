#!/bin/bash
# scripts/send.sh : 표준입력으로 받은 글을 형식 검사 후 전송
#   printf '제목\n- 줄\n' | send.sh
# 기본은 DRY_RUN=1 이라 보내지 않고 글만 화면에 보여 준다. 실제 전송은 .env 에 DRY_RUN=0.
# 비밀 값(토큰, chat id)은 .env 에서만 읽고 화면에 찍지 않는다.
set -euo pipefail

# 호출할 때 정한 DRY_RUN 은 .env 보다 우선한다.
PRE_DRY_RUN="${DRY_RUN-}"
ENV_FILE="${TELEGRAM_ENV:-./.env}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi
[ -n "$PRE_DRY_RUN" ] && DRY_RUN="$PRE_DRY_RUN"
DRY_RUN="${DRY_RUN:-1}"
TOKEN="${TG_BOT_TOKEN:-${TG_TOKEN:-}}"
CHAT_ID="${TG_CHAT_ID:-}"

# 앞뒤 빈 줄은 버린다.
TEXT="$(cat | awk 'NF {found=1} found {print}' | sed -e :a -e '/^[[:space:]]*$/{$d;N;ba' -e '}')"
[ -n "$TEXT" ] || { echo "보낼 글이 비어 있습니다" >&2; exit 1; }

FIRST="$(printf '%s\n' "$TEXT" | head -n1)"
[[ "$FIRST" == -* ]] && { echo "첫 줄은 제목이어야 합니다" >&2; exit 1; }

# 제목 아래에는 '- ' 줄, 빈 줄은 묶음 사이에서만 허용한다.
CHECK='
  NR == 1 { if ($0 ~ /^[ \t]/) bad = "들여쓴 줄이 있습니다"; title = 1; next }
  $0 == "" { if (title) bad = "제목 바로 아래에 줄이 없습니다"; next }
  /^[ \t]/ { bad = "들여쓴 줄이 있습니다"; next }
  /^- / { title = 0; next }
  /^-/ { bad = "\x27- \x27 없는 줄이 있습니다"; next }
  { if (title) bad = "제목 아래에 \x27- \x27 줄이 없습니다"; title = 1 }
  END { if (title && !bad) bad = "제목 아래에 \x27- \x27 줄이 없습니다"; if (bad) { print bad > "/dev/stderr"; exit 1 } }'
printf '%s\n' "$TEXT" | awk "$CHECK"

if [ "$DRY_RUN" != "0" ]; then
  echo "DRY_RUN=1: 보내지 않았습니다. 보낼 글은 아래와 같습니다."
  printf '%s\n' "$TEXT"
  exit 0
fi

[ -n "$TOKEN" ] && [ -n "$CHAT_ID" ] || { echo "토큰이나 chat id 가 .env 에 없습니다" >&2; exit 1; }

# 토큰이 프로세스 목록에 보이지 않게 curl 설정은 표준입력으로 넘긴다.
printf 'url = "https://api.telegram.org/bot%s/sendMessage"\n' "$TOKEN" \
  | curl -s --max-time 15 -K - \
      --data-urlencode "chat_id=${CHAT_ID}" \
      --data-urlencode "text=${TEXT}" > /dev/null
