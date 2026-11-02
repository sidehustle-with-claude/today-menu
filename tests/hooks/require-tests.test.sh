#!/bin/bash
# require-tests.sh 검증: 가짜 npm으로 성공/실패/상한/탈출구를 확인한다. 실제 npm은 부르지 않는다.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/proj/.claude/hooks" "$T/bin"
cp "$HERE/.claude/hooks/"*.sh "$T/proj/.claude/hooks/"
cat > "$T/bin/npm" <<'N'
#!/bin/bash
if [ -f "$FAKE_NPM_PASS" ]; then echo "tests ok"; exit 0; fi
for i in $(seq 1 25); do echo "line $i"; done; echo "FAIL: expected 1 got 2"; exit 1
N
chmod +x "$T/bin/npm"
export PATH="$T/bin:$PATH" CLAUDE_PROJECT_DIR="$T/proj" TMPDIR="$T" FAKE_NPM_PASS="$T/pass"
H="$T/proj/.claude/hooks/require-tests.sh"
C="$T/proj/.claude/hooks/.fail-count"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }

echo '{}' | "$H" 2>"$T/err"; check "실패 1회: 종료 코드 2" $? 2
check "실패 1회: 횟수 1" "$(cat "$C")" 1
check "실패 로그는 마지막 20줄만" "$(grep -c '' "$T/err")" 21
echo '{}' | "$H" 2>/dev/null; check "실패 2회: 종료 코드 2" $? 2
echo '{}' | "$H" 2>"$T/err"; check "실패 3회: 상한이라 종료 코드 0" $? 0
grep -q "3번 연속 실패해 사람에게 넘깁니다" "$T/err"; check "상한 안내 문구" $? 0
[ ! -f "$C" ]; check "상한 뒤 횟수 파일 삭제" $? 0
echo '{}' | "$H" 2>/dev/null; check "상한 뒤 다시 2" $? 2
touch "$T/pass"
echo '{}' | "$H" 2>/dev/null; check "통과: 종료 코드 0" $? 0
[ ! -f "$C" ]; check "통과 뒤 횟수 파일 삭제" $? 0
rm "$T/pass"
echo '{}' | SKIP_HARNESS=1 "$H" 2>/dev/null; check "탈출구 SKIP_HARNESS=1: 0" $? 0
[ ! -f "$C" ]; check "탈출구는 횟수 파일을 만들지 않음" $? 0
echo '{}' | CLAUDE_PROJECT_DIR="$T/없는폴더" "$H" 2>/dev/null; check "폴더 없으면 2(막는 쪽)" $? 2

P="$T/proj/.claude/hooks/protect-harness.sh"
echo '{"tool_input":{"file_path":"/x/.claude/hooks/require-tests.sh"}}' | "$P" 2>/dev/null; check "훅 파일 수정 차단" $? 2
echo '{"tool_input":{"file_path":"/x/.claude/settings.json"}}' | "$P" 2>/dev/null; check "settings.json 수정 차단" $? 2
echo '{"tool_input":{"file_path":"/x/src/app.ts"}}' | "$P" 2>/dev/null; check "일반 파일 통과" $? 0
echo '{"tool_input":{"file_path":"/x/.claude/settings.json"}}' | SKIP_HARNESS=1 "$P" 2>/dev/null; check "protect 탈출구" $? 0

R="$T/proj/.claude/hooks/require-plan.sh"
echo '{}' | "$R" 2>/dev/null; check "PLAN.md 없으면 2" $? 2
cp "$HERE/PLAN.md.example" "$T/proj/PLAN.md"
echo '{}' | "$R" 2>/dev/null; check "승인: 아니오면 2" $? 2
echo '승인: 예' >> "$T/proj/PLAN.md"
echo '{}' | "$R" 2>/dev/null; check "승인: 예 줄이 있으면 0" $? 0

echo "통과 $pass, 실패 $fail"
[ "$fail" -eq 0 ]
