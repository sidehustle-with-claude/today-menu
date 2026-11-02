#!/bin/bash
# console_fill.sh 시험: 가짜 osascript 를 PATH 앞에 두고 크롬 없이 흐름만 확인한다.
# 사용: bash tests/scripts/console-fill.test.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/shots"
printf 'hello\n' > "$T/intro.txt"
printf 'x' > "$T/shots/1.png"; printf 'y' > "$T/shots/2.jpg"
cat > "$T/bin/osascript" <<'F'
#!/bin/bash
# 가짜: 주소 질문엔 FAKE_URL, 그 밖의 JS 는 표준 입력을 로그에 쌓고 상황별 답을 돌려준다
if [ "${1:-}" = "-e" ]; then echo "$FAKE_URL"; exit 0; fi
js="$(cat)"; echo "$js" >> "$FAKE_LOG"
case "$js" in
  *"type='password'"*|*'type=\"password\"'*) echo "${FAKE_STATE:-OK}" ;;
  *miss.push*) echo "${FAKE_MISSING:-}" ;;
  *) echo ok ;;
esac
F
chmod +x "$T/bin/osascript"
export PATH="$T/bin:$PATH" FAKE_LOG="$T/log" PAUSE_SECONDS=0
fail=0; check() { if [ "$2" = "$3" ]; then echo "통과: $1"; else echo "실패: $1 (기대 $2, 실제 $3)"; fail=1; fi; }
run() { bash "$ROOT/scripts/console_fill.sh" "$T/intro.txt" "$T/shots" >"$T/out" 2>&1; echo $?; }

: > "$T/log"; r=$(FAKE_URL="https://evil.example.org/app" run); check "허용 도메인이 아니면 멈춤" 1 "$r"
check "도메인 차단 때 JS 를 실행하지 않음" 0 "$(wc -l < "$T/log" | tr -d ' ')"
r=$(FAKE_URL="https://console.example.com/apps/1" FAKE_STATE=LOGIN run); check "로그인 화면이면 멈춤" 1 "$r"
grep -q "로그인은 사람이 해 주세요" "$T/out" && echo "통과: 로그인 안내 문구" || { echo "실패: 로그인 안내 문구"; fail=1; }
r=$(FAKE_URL="https://console.example.com/apps/1" FAKE_MISSING="스크린샷 칸 (x)" run); check "칸이 없으면 에러로 멈춤" 1 "$r"
grep -q "찾지 못한 칸: 스크린샷 칸" "$T/out" && echo "통과: 없는 칸 이름 출력" || { echo "실패: 없는 칸 이름 출력"; fail=1; }
: > "$T/log"; r=$(FAKE_URL="https://console.example.com/apps/1" run); check "기본 DRY_RUN 은 정상 종료" 0 "$r"
grep -q "DRY_RUN" "$T/out" && echo "통과: DRY_RUN 안내" || { echo "실패: DRY_RUN 안내"; fail=1; }
grep -q "el.value" "$T/log" && { echo "실패: DRY_RUN 인데 입력함"; fail=1; } || echo "통과: DRY_RUN 은 입력하지 않음"
: > "$T/log"; r=$(FAKE_URL="https://console.example.com/apps/1" DRY_RUN=0 run); check "DRY_RUN=0 이면 채움" 0 "$r"
grep -q "el.value" "$T/log" && grep -q "File(\[arr\], '1.png'" "$T/log" && grep -q "File(\[arr\], '2.jpg'" "$T/log" && echo "통과: 소개 글과 스크린샷 2장 입력" || { echo "실패: 입력 내용"; fail=1; }
grep -qi "click()\|submit()\|\.click" "$ROOT/scripts/console_fill.sh" && { echo "실패: 스크립트에 클릭 코드가 있음"; fail=1; } || echo "통과: 스크립트에 클릭·제출 코드 없음"
dd if=/dev/zero of="$T/shots/big.png" bs=1k count=900 2>/dev/null
r=$(FAKE_URL="https://console.example.com/apps/1" DRY_RUN=0 run); check "큰 파일은 거부" 1 "$r"
exit $fail
