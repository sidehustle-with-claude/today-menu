#!/bin/bash
# notify.sh : 텔레그램으로 짧은 알림을 보낸다 (40장)
#
# 사용법
#   ./notify.sh "제목" "줄1" "줄2" ...      제목 한 줄 + 줄마다 '- ' 를 붙여 보냄
#   printf '제목\n- 줄\n' | ./notify.sh -    이미 만든 글을 그대로 보냄 (형식은 호출한 쪽이 책임)
#
# 규칙
#   - 토큰과 chat id 는 .env 에서만 읽는다. 화면에 찍지 않는다.
#   - 둘 중 하나라도 비어 있으면 아무것도 보내지 않고 끝낸다.
#   - DRY_RUN=1 (기본값) 이면 실제로 보내지 않고 보낼 글만 화면에 보여 준다.
#     실제로 보내려면 .env 에 DRY_RUN=0 을 적는다.
#   - 알림은 실패해도 작업을 막지 않도록 늘 종료 코드 0 으로 끝낸다.

HERE="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${NOTIFY_ENV:-$HERE/.env}"

# 호출할 때 이미 정한 DRY_RUN 은 .env 보다 우선한다.
PRE_DRY_RUN="${DRY_RUN-}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE" 2>/dev/null
  set +a
fi
[ -n "$PRE_DRY_RUN" ] && DRY_RUN="$PRE_DRY_RUN"
DRY_RUN="${DRY_RUN:-1}"

TOKEN="${TG_BOT_TOKEN:-${TG_TOKEN:-}}"   # 54·55장 예제의 TG_TOKEN 이름도 받아 준다
CHAT_ID="${TG_CHAT_ID:-}"

if [ "${1:-}" = "-" ]; then
  TEXT="$(cat)"
else
  TITLE="${1:-}"
  if [ -z "$TITLE" ]; then
    echo "notify.sh: 제목이 필요합니다" >&2
    exit 0
  fi
  shift
  TEXT="$TITLE"
  for line in "$@"; do
    TEXT="${TEXT}"$'\n'"- ${line}"
  done
fi

# 텔레그램 sendMessage 글자 수 상한은 4096자
TEXT="${TEXT:0:4096}"

if [ "$DRY_RUN" != "0" ]; then
  echo "[DRY_RUN] 실제로 보내지 않았습니다. 보낼 글:"
  printf '%s\n' "$TEXT"
  exit 0
fi

if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ]; then
  echo "notify.sh: TG_BOT_TOKEN 또는 TG_CHAT_ID 가 비어 있어 보내지 않습니다" >&2
  exit 0
fi

# 토큰이 명령줄(ps)에 보이지 않도록 curl 설정을 표준 입력으로 넘긴다.
printf 'url = "https://api.telegram.org/bot%s/sendMessage"\n' "$TOKEN" \
  | curl -s -o /dev/null -K - \
      --data-urlencode "chat_id=${CHAT_ID}" \
      --data-urlencode "text=${TEXT}" \
  || echo "notify.sh: 전송에 실패했습니다" >&2
exit 0
