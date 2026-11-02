#!/bin/bash
# morning-report.sh / collect-menu.sh / post-daily.sh 검증. 인터넷, 텔레그램, SNS에 나가지 않는다.
# 저장소 안의 스크립트를 임시 폴더로 복사해서 돌린다. notify.sh 는 가짜(받은 글을 기록만 함)로 바꾼다.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
W="$T/w"; mkdir -p "$W"
cp -R "$HERE/fixtures" "$HERE/config" "$HERE/posts" "$W/"
cp "$HERE/morning-report.sh" "$HERE/build_report.py" "$HERE/collect-menu.sh" "$HERE/post-daily.sh" "$W/"
cat > "$W/notify.sh" <<'N'
#!/bin/bash
{ if [ "${1:-}" = "-" ]; then cat; else printf '%s\n' "$@"; fi; echo "----"; } >> "${FAKE_NOTIFY_LOG:?}"
N
chmod +x "$W/notify.sh"
export FAKE_NOTIFY_LOG="$T/notify.log"
cd "$W" || exit 1
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }

echo "== 아침 리포트 =="
./morning-report.sh >/dev/null 2>&1; check "정상 리포트 전송 경로" $? 0
head -1 "$FAKE_NOTIFY_LOG" | grep -q "어제의 today-menu"; check "첫 줄이 제목" $? 0
grep -q "^- 방문자 128명" "$FAKE_NOTIFY_LOG"; check "- 줄 형식" $? 0
: > "$FAKE_NOTIFY_LOG"
for bad in $'제목\n본문 줄' $'제목\n-붙은줄' $'제목\n  - 들여쓴줄' $'- 제목아님\n- 줄' $'제목만'; do
  STATS_FILE=/dev/null python3 -c 1
  printf '%s\n' "$bad" > "$T/bad.txt"
  cp build_report.py "$T/build_report.keep"
  printf '#!/usr/bin/env python3\nprint(open("%s").read().rstrip("\\n"))\n' "$T/bad.txt" > build_report.py
  ./morning-report.sh >/dev/null 2>&1; rc=$?
  check "틀린 형식 거부: $(echo "$bad" | head -2 | tr '\n' '/')" $rc 1
  cp "$T/build_report.keep" build_report.py
done
[ ! -s "$FAKE_NOTIFY_LOG" ]; check "틀린 형식은 전송 안 됨" $? 0
grep -q "형식 오류" report.log; check "report.log 에 기록" $? 0
STATS_FILE="$T/없음.json" ./morning-report.sh >/dev/null 2>&1; check "숫자 파일 없음: 1" $? 1

echo "== 수집 =="
SLEEP_SECS=0 TODAY=2026-11-03 ./collect-menu.sh >"$T/c.out" 2>&1; check "수집 성공" $? 0
[ -f data/2026-11-03.json ]; check "data/날짜.json 생성" $? 0
python3 -c 'import json;d=json.load(open("data/2026-11-03.json"));assert [x["path"] for x in d]==["/menu/korean.json","/menu/noodle.json","/menu/rice.json"]'; check "막힌 경로 빼고 3개" $? 0
grep -q "건너뜀(robots.txt에서 막힘): /private/draft.json" "$T/c.out"; check "robots 막힘 건너뜀" $? 0
check "요청 수 기록(robots 1 + 3)" "$(cat data/.requests-2026-11-03)" 4
SLEEP_SECS=0 TODAY=2026-11-03 DAILY_LIMIT=4 ./collect-menu.sh >/dev/null 2>&1; check "상한 도달이면 조용히 0" $? 0
rm -f data/*
s=$(date +%s); SLEEP_SECS=1 TODAY=2026-11-04 ./collect-menu.sh >/dev/null 2>&1; e=$(date +%s)
[ $((e - s)) -ge 3 ]; check "요청 사이 쉬는 시간(1초×3)" $? 0
rm -f data/*
printf '/menu/a.json\n/menu/b.json\n/menu/c.json\n/menu/korean.json\n' > "$T/fail-paths.txt"
SLEEP_SECS=0 TODAY=2026-11-05 PATHS_FILE="$T/fail-paths.txt" ./collect-menu.sh >"$T/c.out" 2>&1; check "연속 3번 실패하면 1" $? 1
grep -q "실패(3/3)" "$T/c.out"; check "3번째 실패에서 멈춤" $? 0
grep -q "메뉴 수집 중단" "$FAKE_NOTIFY_LOG"; check "중단 알림" $? 0
! grep -q "korean" "$T/c.out"; check "멈춘 뒤 4번째는 안 읽음" $? 0
rm -f data/*
SLEEP_SECS=0 TODAY=2026-11-06 DAILY_LIMIT=3 ./collect-menu.sh >/dev/null 2>&1
check "하루 상한 3: 요청 3번만" "$(cat data/.requests-2026-11-06)" 3
MOCK=0 SOURCE_BASE= ./collect-menu.sh >/dev/null 2>&1; check "MOCK=0 은 SOURCE_BASE 필수" $? 1

echo "== 게시 =="
: > "$FAKE_NOTIFY_LOG"
TODAY=2026-11-03 ./post-daily.sh >"$T/p.out" 2>&1; check "DRY_RUN 기본: 0" $? 0
grep -q "DRY_RUN=1" "$T/p.out"; check "DRY_RUN 안내" $? 0
[ ! -f posted.json ]; check "DRY_RUN 은 posted.json 안 만듦" $? 0
grep -q "\[게시 확인 요청\]" "$FAKE_NOTIFY_LOG"; check "확인 요청 알림" $? 0
DRY_RUN=0 TODAY=2026-11-03 ./post-daily.sh >/dev/null 2>&1; check "DRY_RUN=0 인데 POST_CMD 없음: 1" $? 1
DRY_RUN=0 TODAY=2026-11-03 POST_CMD='cat >/dev/null; echo https://example.com/p/1' ./post-daily.sh >/dev/null 2>&1; check "게시 성공" $? 0
grep -q '"2026-11-03"' posted.json; check "posted.json 에 날짜 기록" $? 0
grep -q "\[업로드 완료\]" "$FAKE_NOTIFY_LOG"; check "완료 알림" $? 0
: > "$T/cmd.count"
DRY_RUN=0 TODAY=2026-11-03 POST_CMD='echo x >> '"$T"'/cmd.count; echo https://example.com/p/2' ./post-daily.sh >"$T/p.out" 2>&1; check "같은 날 두 번째: 0" $? 0
check "같은 날 두 번째는 POST_CMD 안 부름" "$(wc -l < "$T/cmd.count" | tr -d ' ')" 0
grep -q "이미 게시함" post.log; check "post.log 에 기록" $? 0
touch posts/HOLD
DRY_RUN=0 TODAY=2026-11-07 POST_CMD='echo x >> '"$T"'/cmd.count; echo l' ./post-daily.sh >/dev/null 2>&1
check "HOLD 면 안 올림" "$(wc -l < "$T/cmd.count" | tr -d ' ')" 0
rm posts/HOLD
: > "$T/cmd.count"
DRY_RUN=0 TODAY=2026-11-08 RETRY_SLEEP=0 POST_CMD='echo x >> '"$T"'/cmd.count; exit 1' ./post-daily.sh >/dev/null 2>&1; check "계속 실패하면 1" $? 1
check "재시도는 처음 1 + 2번 = 3번" "$(wc -l < "$T/cmd.count" | tr -d ' ')" 3
grep -q "게시 실패" "$FAKE_NOTIFY_LOG"; check "실패 알림" $? 0
! grep -q "2026-11-08" posted.json; check "실패한 날은 기록 안 함" $? 0
: > "$T/cmd.count"
DRY_RUN=0 TODAY=2026-11-09 RETRY_SLEEP=0 POST_CMD='n=$(wc -l < '"$T"'/cmd.count); echo x >> '"$T"'/cmd.count; [ "$n" -ge 1 ] && echo https://example.com/p/9' ./post-daily.sh >/dev/null 2>&1; check "한 번 실패 뒤 재시도 성공" $? 0
echo "통과 $pass, 실패 $fail"; [ "$fail" -eq 0 ]
