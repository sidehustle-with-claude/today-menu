#!/bin/bash
# check-goal-result.sh 검증: 임시 git 저장소 + 가짜 npm. 실제 저장소는 건드리지 않는다.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/r/tests" "$T/r/src"
cat > "$T/bin/npm" <<'N'
#!/bin/bash
[ -f "$FAKE_NPM_FAIL" ] && { echo "FAIL"; exit 1; }
echo "ok"; exit 0
N
chmod +x "$T/bin/npm"
export PATH="$T/bin:$PATH" FAKE_NPM_FAIL="$T/fail" CLAUDE_PROJECT_DIR="$T/r"
cd "$T/r" || exit 1
git init -q . && git config user.email t@example.com && git config user.name t
echo a > src/app.ts; echo t > tests/menu.test.ts
git add -A && git commit -qm init
S="$HERE/scripts/check-goal-result.sh"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }

"$S" >"$T/out" 2>&1; check "깨끗한 상태: 0" $? 0
grep -q "테스트 파일은 그대로" "$T/out"; check "그대로라고 안내" $? 0
echo b >> src/app.ts
"$S" >"$T/out" 2>&1; check "소스만 바뀜: 0" $? 0
grep -q "src/app.ts" "$T/out"; check "diff --stat에 소스 표시" $? 0
echo x >> tests/menu.test.ts
"$S" >"$T/out" 2>&1; check "테스트 파일 변경: 1" $? 1
grep -q "tests/menu.test.ts" "$T/out"; check "바뀐 테스트 파일 이름 표시" $? 0
git checkout -q tests/menu.test.ts
touch "$T/fail"
"$S" >"$T/out" 2>&1; check "테스트 실패: 1" $? 1
grep -q "테스트 실패" "$T/out"; check "실패 안내" $? 0
echo "통과 $pass, 실패 $fail"; [ "$fail" -eq 0 ]
