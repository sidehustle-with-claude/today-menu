#!/bin/bash
# wiki-lint.sh : 위키 창고 점검 (56장 '정기 정리')
#   scripts/wiki-lint.sh            점검하고 문제가 있으면 종료 코드 1
# 점검 항목
#   1. 모든 문서에 프론트매터(type, topic, status, updated)가 있다
#   2. type 이 폴더와 맞다(knowledge/ 는 knowledge, decisions/ 는 decision)
#   3. status: active 문서는 CATALOG.md 에 있고, CATALOG.md 의 모든 줄은 실제 파일을 가리킨다
#   4. status: retired 문서는 superseded_by 가 있고 그 파일이 있다
#   5. 개인정보나 키처럼 보이는 문자열이 없다(전화번호, 주민번호 모양, 키/토큰 모양)
#   6. (경고) 6개월 넘게 갱신되지 않은 문서
# 환경변수 WIKI_ROOT 로 다른 폴더를 점검할 수 있다.
ROOT="${WIKI_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT" || exit 1

errors=0
warns=0
err()  { echo "오류: $*"; errors=$((errors + 1)); }
warn() { echo "경고: $*"; warns=$((warns + 1)); }

# 프론트매터에서 값 하나를 읽는다.
fm() { # 파일 키
  awk -v k="$2" 'NR==1 && $0!="---" {exit} NR>1 && $0=="---" {exit} NR>1 { i=index($0,":"); if (i>0 && substr($0,1,i-1)==k) { v=substr($0,i+1); sub(/^[ \t]+/,"",v); print v; exit } }' "$1"
}

docs=$(find knowledge decisions -name '*.md' 2>/dev/null | sort)
[ -n "$docs" ] || echo "문서가 없습니다"

for f in $docs; do
  head -n 1 "$f" | grep -q '^---$' || { err "$f: 프론트매터가 없다"; continue; }
  type=$(fm "$f" type); topic=$(fm "$f" topic); status=$(fm "$f" status); updated=$(fm "$f" updated)
  [ -n "$type" ]    || err "$f: type 이 없다"
  [ -n "$topic" ]   || err "$f: topic 이 없다"
  [ -n "$status" ]  || err "$f: status 가 없다"
  [ -n "$updated" ] || err "$f: updated 가 없다"
  case "$f" in
    knowledge/*) [ -z "$type" ] || [ "$type" = "knowledge" ] || err "$f: knowledge/ 안인데 type 이 $type" ;;
    decisions/*) [ -z "$type" ] || [ "$type" = "decision" ]  || err "$f: decisions/ 안인데 type 이 $type" ;;
  esac
  case "$status" in
    active|retired|'') ;;
    *) err "$f: status 는 active 또는 retired 여야 한다 ($status)" ;;
  esac

  rel="${f#knowledge/}"; rel="${rel#decisions/}"; rel="${rel%.md}"
  if [ "$status" = "retired" ]; then
    sup=$(fm "$f" superseded_by)
    if [ -z "$sup" ]; then err "$f: retired 인데 superseded_by 가 없다"
    elif [ ! -f "$sup" ]; then err "$f: superseded_by 가 가리키는 파일이 없다 ($sup)"; fi
  elif [ "$status" = "active" ]; then
    grep -qF -- "- $rel" CATALOG.md 2>/dev/null || err "$f: CATALOG.md 에 없다"
  fi

  # 6개월(180일) 넘게 갱신 안 됨
  if [ -n "$updated" ]; then
    age=$(python3 - "$updated" <<'PY' 2>/dev/null
import sys, datetime
try:
    d = datetime.date.fromisoformat(sys.argv[1])
    print((datetime.date.today() - d).days)
except ValueError:
    print(-1)
PY
)
    if [ "$age" = "-1" ]; then err "$f: updated 날짜 형식이 YYYY-MM-DD 가 아니다 ($updated)"
    elif [ "${age:-0}" -gt 180 ]; then warn "$f: ${age}일째 갱신되지 않았다"; fi
  fi
done

# CATALOG.md 의 줄이 실제 파일을 가리키는지
if [ -f CATALOG.md ]; then
  section=""
  while IFS= read -r line; do
    case "$line" in
      "## knowledge") section=knowledge ;;
      "## decisions") section=decisions ;;
      "- "*)
        rel="${line#- }"
        [ -n "$section" ] && { [ -f "$section/$rel.md" ] || err "CATALOG.md: $section/$rel.md 파일이 없다"; }
        ;;
    esac
  done < CATALOG.md
else
  err "CATALOG.md 가 없다"
fi

# 개인정보·키 모양 검사 (문서와 목차만)
scan() { # 이름 정규식
  local hits
  hits=$(grep -rnE -- "$2" knowledge decisions CATALOG.md 2>/dev/null)
  [ -z "$hits" ] || { while IFS= read -r h; do err "$1처럼 보이는 문자열: $h"; done <<< "$hits"; }
}
scan "전화번호"       '0[0-9]{1,2}-[0-9]{3,4}-[0-9]{4}'
scan "주민번호"       '[0-9]{6}-[1-4][0-9]{6}'
scan "API 키"        '(sk|pk|re|ghp|gho|xox[bpas])[-_][A-Za-z0-9_-]{16,}'
scan "봇 토큰"        '[0-9]{8,10}:[A-Za-z0-9_-]{30,}'
scan "비밀번호 대입"   '(password|passwd|secret|token)[[:space:]]*[:=][[:space:]]*[^[:space:]<예]{8,}'

echo "점검 끝: 오류 $errors, 경고 $warns"
[ "$errors" -eq 0 ]
