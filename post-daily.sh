#!/bin/bash
# post-daily.sh : 오늘의 메뉴 글을 하루에 딱 1개만 올린다 (54장)
#   ./post-daily.sh
# 흐름
#   1. posted.json 에 오늘 날짜가 있으면 여기서 끝낸다(중복 방지).
#   2. posts/HOLD 파일이 있으면 올리지 않는다(사람이 막는 법: touch posts/HOLD).
#   3. 텔레그램으로 "[게시 확인 요청]" 을 보낸다.
#   4. POST_CMD 로 올린다. 실패하면 최대 2번 더 시도하고, 그래도 안 되면 알림만 보내고 멈춘다.
#   5. 올린 직후 posted.json 에 적고 "[업로드 완료]" 를 보낸다.
# 모드
#   DRY_RUN=1 (기본)  올리지 않는다. 무엇을 할지 화면에만 보여 주고 posted.json 도 건드리지 않는다.
#   DRY_RUN=0         POST_CMD 를 실제로 부른다.
# POST_CMD : 글을 표준 입력으로 받아 올리고, 성공하면 글 링크(또는 ID)를 한 줄로 출력하는 명령.
#   공식 API 를 쓰는 명령을 넣는다. 로그인과 본인인증은 사람이 미리 해 둔다. 스크립트가 대신하지 않는다.
set -uo pipefail
cd "$(dirname "$0")"

DRY_RUN="${DRY_RUN:-1}"
TEXT_FILE="${POST_TEXT_FILE:-posts/today.txt}"
POSTED_FILE="${POSTED_FILE:-posted.json}"
TODAY="${TODAY:-$(date +%F)}"
RETRIES="${RETRIES:-2}"
RETRY_SLEEP="${RETRY_SLEEP:-30}"

alert() { [ -x ./notify.sh ] && ./notify.sh "$@" || true; }

# 하루 상한 1개: 게시 전에 확인한다.
if grep -q "\"$TODAY\"" "$POSTED_FILE" 2>/dev/null; then
  echo "오늘은 이미 게시함" >> post.log
  echo "오늘은 이미 게시함"
  exit 0
fi

if [ -e posts/HOLD ]; then
  echo "posts/HOLD 가 있어서 올리지 않습니다"
  exit 0
fi

if [ ! -s "$TEXT_FILE" ]; then
  echo "post-daily.sh: 올릴 글이 없습니다 ($TEXT_FILE)" >&2
  exit 1
fi

first_line="$(head -n 1 "$TEXT_FILE")"
alert "[게시 확인 요청]" "오늘 올릴 글: $first_line" "막으려면 posts/HOLD 파일을 만드세요"

if [ "$DRY_RUN" != "0" ]; then
  echo "DRY_RUN=1: 실제로 올리지 않았습니다. 올릴 글은 아래와 같습니다."
  cat "$TEXT_FILE"
  exit 0
fi

if [ -z "${POST_CMD:-}" ]; then
  echo "post-daily.sh: DRY_RUN=0 이면 POST_CMD 가 필요합니다" >&2
  exit 1
fi

attempt=0
max=$((RETRIES + 1))
link=""
while [ "$attempt" -lt "$max" ]; do
  attempt=$((attempt + 1))
  if link="$(bash -c "$POST_CMD" < "$TEXT_FILE")" && [ -n "$link" ]; then
    break
  fi
  link=""
  echo "게시 실패 ($attempt/$max)" >> post.log
  [ "$attempt" -lt "$max" ] && sleep "$RETRY_SLEEP"
done

if [ -z "$link" ]; then
  alert "게시 실패" "${max}번 시도해도 올리지 못했습니다" "자동 재시도는 여기서 멈춥니다"
  exit 1
fi

# 게시 직후에 적는다.
python3 - "$POSTED_FILE" "$TODAY" "$link" <<'PY'
import json, sys
path, day, link = sys.argv[1:4]
try:
    with open(path, encoding="utf-8") as f:
        rows = json.load(f)
except (OSError, ValueError):
    rows = []
rows.append({"date": day, "id": link})
with open(path, "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY
alert "[업로드 완료]" "오늘의 메뉴 글" "링크: $link"
echo "올림: $link"
