#!/bin/bash
# 위키 훅 두 개와 wiki-lint.sh 검증. 임시 폴더에 복사해서 돌린다.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }
cp -R "$HERE/hooks" "$HERE/scripts" "$HERE/knowledge" "$HERE/decisions" "$HERE/CATALOG.md" "$T/"

echo "== inject-decisions =="
out=$(CLAUDE_PROJECT_DIR=/x/today-menu WIKI_REPO=today-menu bash "$T/hooks/inject-decisions.sh" </dev/null); check "종료 코드 0" $? 0
echo "$out" | head -1 | grep -q "이미 정해진 결정"; check "첫 줄 안내" $? 0
echo "$out" | grep -q -- "- _global/answer-in-korean$"; check "_global 결정 제목" $? 0
echo "$out" | grep -q -- "- today-menu/notifications-use-title-and-dash-lines$"; check "프로젝트 결정 제목" $? 0
! echo "$out" | grep -q "결정: "; check "본문은 안 넣음" $? 0
out=$(WIKI_REPO=other bash "$T/hooks/inject-decisions.sh" </dev/null)
! echo "$out" | grep -q "today-menu/"; check "다른 저장소 이름이면 today-menu 결정 안 나옴" $? 0
sed -i.bak 's/^status: active/status: retired/' "$T/decisions/_global/answer-in-korean.md"
out=$(WIKI_REPO=today-menu bash "$T/hooks/inject-decisions.sh" </dev/null)
! echo "$out" | grep -q "answer-in-korean"; check "폐기된 결정은 뺌" $? 0
# git 저장소 이름으로 REPO 를 정하는 경로
mkdir -p "$T/proj/today-menu" && ( cd "$T/proj/today-menu" && git init -q . )
out=$(CLAUDE_PROJECT_DIR="$T/proj/today-menu" bash "$T/hooks/inject-decisions.sh" </dev/null)
echo "$out" | grep -q "today-menu/notifications"; check "저장소 폴더 이름으로 결정 고름" $? 0
mv "$T/decisions/_global/answer-in-korean.md.bak" "$T/decisions/_global/answer-in-korean.md"

echo "== ask-to-record =="
export TMPDIR="$T"
echo '{"session_id":"s1"}' | bash "$T/hooks/ask-to-record.sh" 2>"$T/err"; check "첫 번째: 2(되묻기)" $? 2
grep -q "기록할 것 없음" "$T/err"; check "안내 문구" $? 0
echo '{"session_id":"s1"}' | bash "$T/hooks/ask-to-record.sh" 2>/dev/null; check "같은 세션 두 번째: 0" $? 0
echo '{"session_id":"s2"}' | bash "$T/hooks/ask-to-record.sh" 2>/dev/null; check "다른 세션은 다시 2" $? 2
echo '{}' | bash "$T/hooks/ask-to-record.sh" 2>/dev/null; check "세션 번호 없으면 0" $? 0
echo '{"session_id":"s3"}' | SKIP_HARNESS=1 bash "$T/hooks/ask-to-record.sh" 2>/dev/null; check "SKIP_HARNESS=1: 0" $? 0
echo '{"session_id":"../../etc/x"}' | bash "$T/hooks/ask-to-record.sh" 2>/dev/null; check "경로 문자 섞인 세션 번호도 안전" $? 2
[ -f "$T/wiki-asked-....etcx" ] || [ -f "$T/wiki-asked-etcx" ]; check "표시 파일은 TMPDIR 안에만" $? 0

echo "== wiki-lint =="
bash "$T/scripts/wiki-lint.sh" >"$T/lint.out"; check "기본 위키는 통과" $? 0
cp -R "$T" "$T-bad" 2>/dev/null; B="$T-bad"
trap 'rm -rf "$T" "$B"' EXIT
cd "$B"
printf -- '---\ntype: knowledge\ntopic: x\nstatus: active\nupdated: 2026-11-01\n---\n\n# 목차에 없음\n- 줄\n' > knowledge/api/not-in-catalog.md
bash scripts/wiki-lint.sh >"$T/l.out"; rc=$?; check "목차에 없는 문서: 1" $rc 1
grep -q "not-in-catalog.md: CATALOG.md 에 없다" "$T/l.out"; check "목차 누락 메시지" $? 0
rm knowledge/api/not-in-catalog.md
printf '# 프론트매터 없음\n- 줄\n' > knowledge/api/no-frontmatter.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "프론트매터 없음: 1" $? 1
rm knowledge/api/no-frontmatter.md
echo '- api/ghost
  — 없는 파일' >> CATALOG.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "목차가 없는 파일을 가리킴: 1" $? 1
grep -q "ghost.md 파일이 없다" "$T/l.out"; check "ghost 메시지" $? 0
cp "$HERE/CATALOG.md" CATALOG.md
printf -- '---\ntype: knowledge\ntopic: x\nstatus: retired\nupdated: 2026-11-01\n---\n' > knowledge/api/old.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "retired 인데 superseded_by 없음: 1" $? 1
printf -- '---\ntype: knowledge\ntopic: x\nstatus: retired\nsuperseded_by: knowledge/api/nope.md\nupdated: 2026-11-01\n---\n' > knowledge/api/old.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "superseded_by 대상 없음: 1" $? 1
printf -- '---\ntype: knowledge\ntopic: x\nstatus: retired\nsuperseded_by: knowledge/tooling/regenerate-must-be-idempotent.md\nupdated: 2026-11-01\n---\n' > knowledge/api/old.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "올바른 폐기 문서: 0" $? 0
rm knowledge/api/old.md
printf -- '---\ntype: decision\ntopic: x\nstatus: active\nupdated: 2026-11-01\n---\n' > knowledge/api/wrongtype.md
echo "- api/wrongtype" >> CATALOG.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "폴더와 type 불일치: 1" $? 1
rm knowledge/api/wrongtype.md; cp "$HERE/CATALOG.md" CATALOG.md
# 가짜 비밀값 (이 시험용으로 문자열을 조립한다)
fake_phone="010-$(printf '%s' 1234)-5678"
printf -- '- 전화 %s\n' "$fake_phone" >> knowledge/api/list-endpoint-returns-200-even-when-empty.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "전화번호 모양: 1" $? 1
cp "$HERE/knowledge/api/list-endpoint-returns-200-even-when-empty.md" knowledge/api/
fake_key="sk-$(printf 'a%.0s' $(seq 1 24))"
printf -- '- 키 %s\n' "$fake_key" >> knowledge/tooling/regenerate-must-be-idempotent.md
bash scripts/wiki-lint.sh >"$T/l.out"; check "키 모양: 1" $? 1
! grep -q "$fake_key" /dev/null; true
cp "$HERE/knowledge/tooling/regenerate-must-be-idempotent.md" knowledge/tooling/
sed -i.bak 's/updated: 2026-11-01/updated: 2024-01-01/' knowledge/api/list-endpoint-returns-200-even-when-empty.md
bash scripts/wiki-lint.sh >"$T/l.out"; rc=$?; check "오래된 문서는 경고만: 0" $rc 0
grep -q "경고: .*갱신되지 않았다" "$T/l.out"; check "경고 메시지" $? 0
echo "통과 $pass, 실패 $fail"; [ "$fail" -eq 0 ]
