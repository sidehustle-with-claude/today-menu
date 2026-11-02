#!/bin/bash
# check-deploy.sh 검증: 로컬 python 서버(200/404)만 부른다. 외부 호출 없음.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d); mkdir -p "$T/www"; echo ok > "$T/www/index.html"
PORT=$((20000 + RANDOM % 20000))
( cd "$T/www" && python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 ) &
SP=$!
trap 'kill $SP 2>/dev/null; rm -rf "$T"' EXIT
for i in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.2; done
S="$HERE/scripts/check-deploy.sh"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }

out=$("$S" "http://127.0.0.1:$PORT/"); rc=$?
check "200: 종료 코드 0" $rc 0
check "200: 출력 없음" "$out" ""
out=$(DEPLOY_URL="http://127.0.0.1:$PORT/" "$S"); check "환경변수 주소" $? 0
out=$("$S" "http://127.0.0.1:$PORT/없는페이지"); rc=$?
check "404: 종료 코드 1" $rc 1
check "404: 메시지" "$out" "today-menu 응답 이상: HTTP 404"
out=$(CHECK_TIMEOUT=2 "$S" "http://127.0.0.1:1/"); rc=$?
check "연결 불가: 종료 코드 1" $rc 1
check "연결 불가: HTTP 000" "$out" "today-menu 응답 이상: HTTP 000"
echo "통과 $pass, 실패 $fail"; [ "$fail" -eq 0 ]
