#!/bin/bash
# collect-menu.sh : 공개 메뉴 데이터를 하루 한 번 모아 data/YYYY-MM-DD.json 으로 저장한다 (54장)
#   ./collect-menu.sh
# 안전장치
#   - 요청 사이에 SLEEP_SECS(기본 2)초 쉰다.
#   - 연속 3번 실패하면 멈추고 알린다.
#   - 하루 요청은 DAILY_LIMIT(기본 20)번을 넘지 않는다(robots.txt 확인도 1번으로 센다).
#   - robots.txt 에서 막힌 경로(Disallow)는 건드리지 않는다.
# 모드
#   MOCK=1 (기본)  fixtures/collect/ 안의 가상 파일만 읽는다. 인터넷에 나가지 않는다.
#   MOCK=0         SOURCE_BASE 로 실제 요청을 보낸다. 먼저 사이트의 이용약관과 robots.txt 를 사람이 읽는다.
# 사람 몫: 약관이 자동 수집을 허용하는지, 공식 API나 공개 데이터 파일이 따로 있는지 확인하는 일.
set -uo pipefail
cd "$(dirname "$0")"

MOCK="${MOCK:-1}"
SOURCE_BASE="${SOURCE_BASE:-}"
PATHS_FILE="${PATHS_FILE:-config/collect-paths.txt}"
MOCK_DIR="${MOCK_DIR:-fixtures/collect}"
SLEEP_SECS="${SLEEP_SECS:-2}"
DAILY_LIMIT="${DAILY_LIMIT:-20}"
MAX_FAILS="${MAX_FAILS:-3}"
TODAY="${TODAY:-$(date +%F)}"

mkdir -p data
OUT="data/$TODAY.json"
COUNT_FILE="data/.requests-$TODAY"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ "$MOCK" = "0" ] && [ -z "$SOURCE_BASE" ]; then
  echo "collect-menu.sh: MOCK=0 이면 SOURCE_BASE 가 필요합니다" >&2
  exit 1
fi

alert() { # 제목, 줄...
  [ -x ./notify.sh ] && ./notify.sh "$@" || true
}

# 오늘 쓴 요청 수를 하나 올린다. 상한이면 1 을 돌려준다.
use_request() {
  local n
  n="$(cat "$COUNT_FILE" 2>/dev/null || echo 0)"
  if [ "$n" -ge "$DAILY_LIMIT" ]; then return 1; fi
  echo $((n + 1)) > "$COUNT_FILE"
}

# 한 경로를 가져와 $TMP/body 에 쓴다. 성공하면 0.
fetch() {
  local path="$1"
  if [ "$MOCK" = "1" ]; then
    [ -f "$MOCK_DIR$path" ] && cp "$MOCK_DIR$path" "$TMP/body"
  else
    curl -fsS --max-time 15 -o "$TMP/body" "$SOURCE_BASE$path" 2>/dev/null
  fi
}

# robots.txt 확인 (User-agent: * 아래의 Disallow 만 본다)
use_request || { echo "오늘 요청 상한($DAILY_LIMIT)에 이미 도달" >&2; exit 0; }
if [ "$MOCK" = "1" ]; then
  [ -f "$MOCK_DIR/robots.txt" ] && cp "$MOCK_DIR/robots.txt" "$TMP/robots.txt"
else
  curl -fsS --max-time 15 -o "$TMP/robots.txt" "$SOURCE_BASE/robots.txt" 2>/dev/null
fi
: > "$TMP/disallow"
if [ -f "$TMP/robots.txt" ]; then
  awk 'tolower($1)=="user-agent:" {all = ($2=="*")} all && tolower($1)=="disallow:" && $2!="" {print $2}' \
    "$TMP/robots.txt" > "$TMP/disallow"
fi

blocked() { # 경로가 Disallow 접두어로 시작하면 0
  local p="$1" d
  while IFS= read -r d; do
    case "$p" in "$d"*) return 0 ;; esac
  done < "$TMP/disallow"
  return 1
}

fails=0; ok=0; skipped=0; first=1
printf '[' > "$TMP/items"
while IFS= read -r path; do
  case "$path" in ''|'#'*) continue ;; esac
  if blocked "$path"; then
    echo "건너뜀(robots.txt에서 막힘): $path"
    skipped=$((skipped + 1))
    continue
  fi
  if ! use_request; then
    echo "오늘 요청 상한($DAILY_LIMIT)에 도달해 여기서 멈춥니다" >&2
    alert "메뉴 수집 상한" "오늘 요청 ${DAILY_LIMIT}번을 다 써서 멈춤"
    break
  fi
  rm -f "$TMP/body"
  if fetch "$path" && python3 -c 'import json,sys; json.load(open(sys.argv[1], encoding="utf-8"))' "$TMP/body" 2>/dev/null; then
    fails=0
    [ "$first" = "1" ] || printf ',' >> "$TMP/items"
    first=0
    printf '{"path":"%s","data":' "$path" >> "$TMP/items"
    cat "$TMP/body" >> "$TMP/items"
    printf '}' >> "$TMP/items"
    ok=$((ok + 1))
    echo "받음: $path"
  else
    fails=$((fails + 1))
    echo "실패($fails/$MAX_FAILS): $path" >&2
    if [ "$fails" -ge "$MAX_FAILS" ]; then
      alert "메뉴 수집 중단" "연속 ${MAX_FAILS}번 실패해서 멈춤" "마지막 경로: $path"
      printf ']' >> "$TMP/items"
      [ "$ok" -gt 0 ] && cp "$TMP/items" "$OUT"
      exit 1
    fi
  fi
  sleep "$SLEEP_SECS"
done < "$PATHS_FILE"
printf ']' >> "$TMP/items"

if [ "$ok" -gt 0 ]; then
  cp "$TMP/items" "$OUT"
  echo "저장: $OUT (받음 $ok, 건너뜀 $skipped)"
else
  echo "저장할 데이터가 없어서 $OUT 은 만들지 않았습니다" >&2
  exit 1
fi
