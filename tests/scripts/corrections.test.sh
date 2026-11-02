#!/bin/bash
# extract-my-messages.py / count-corrections.py 검증: 가상 fixtures 만 쓴다. 진짜 기록(~/.claude)은 읽지 않는다.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
EX="$HERE/scripts/extract-my-messages.py"; CO="$HERE/scripts/count-corrections.py"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }

python3 "$EX" --root "$HERE/fixtures/sessions" --out "$T/m.tsv" >"$T/o"; check "추출 성공" $? 0
check "내 말 10줄(도구 결과, isMeta, 깨진 줄, 필드 없는 줄 제외)" "$(wc -l < "$T/m.tsv" | tr -d ' ')" 10
! grep -q "가짜 시스템 줄" "$T/m.tsv"; check "isMeta 제외" $? 0
! grep -q "ok$" "$T/m.tsv"; check "도구 결과 제외" $? 0
! grep -q "버튼을 만들었습니다" "$T/m.tsv"; check "클로드 말 제외" $? 0
grep -q "한국어로 답해 줘" "$T/m.tsv"; check "블록 목록의 text 도 읽음" $? 0
grep -q "<이메일>" "$T/m.tsv" && grep -q "<전화>" "$T/m.tsv"; check "이메일, 전화번호 가림" $? 0
! grep -q "example.com" "$T/m.tsv"; check "가려진 원문 없음" $? 0
check "칸은 4개(탭이 문장 안에 섞이지 않음)" "$(awk -F'\t' '{print NF}' "$T/m.tsv" | sort -u)" 4
! grep -q "점심 메뉴" "$T/o"; check "화면에는 문장 내용이 안 나옴" $? 0
python3 "$EX" --root "$HERE/fixtures/sessions" --out "$T/s.tsv" --since 2026-11-01 >/dev/null; check "--since" $? 0
check "--since 이후 4줄" "$(wc -l < "$T/s.tsv" | tr -d ' ')" 4
python3 "$EX" --root "$HERE/fixtures/sessions" --out "$T/x.tsv" --since 어제 >/dev/null 2>&1; check "--since 형식 오류: 2" $? 2
python3 "$EX" --root "$T/없는폴더" --out "$T/x.tsv" >/dev/null 2>&1; check "기록 폴더 없음: 1" $? 1
mkdir -p "$T/empty/p"; python3 "$EX" --root "$T/empty" --out "$T/x.tsv" >/dev/null 2>&1; check "뽑힌 게 없으면 1" $? 1

python3 "$CO" "$T/m.tsv" >"$T/c.out"; check "세기 성공" $? 0
grep -q "내 말 전체: 10줄" "$T/c.out"; check "전체 10줄" $? 0
grep -q "'아니'로 시작: 2줄" "$T/c.out"; check "아니 2" $? 0
grep -q "'그게 아니'로 시작: 1줄" "$T/c.out"; check "그게 아니 1" $? 0
grep -q "'다시'로 시작: 2줄" "$T/c.out"; check "다시 2" $? 0
grep -q "'왜'로 시작: 1줄" "$T/c.out"; check "왜 1" $? 0
! grep -q "버튼이 아니라" "$T/c.out"; check "문장 원문은 안 나옴" $? 0
python3 "$CO" "$T/m.tsv" --until 2026-11-02 >"$T/b.out"; grep -q "내 말 전체: 6줄" "$T/b.out"; check "전(--until): 6줄" $? 0
python3 "$CO" "$T/m.tsv" --since 2026-11-03 >"$T/a.out"; grep -q "내 말 전체: 4줄" "$T/a.out"; check "후(--since): 4줄" $? 0
grep -q "'아니'로 시작: 1줄" "$T/a.out"; check "후 구간 아니 1" $? 0
python3 "$CO" "$T/없음.tsv" >/dev/null 2>&1; check "파일 없음: 1" $? 1
printf 'x\n\n탭없는줄\n' > "$T/bad.tsv"; python3 "$CO" "$T/bad.tsv" >/dev/null 2>&1; check "깨진 tsv 도 안 죽음" $? 0
echo "통과 $pass, 실패 $fail"; [ "$fail" -eq 0 ]
