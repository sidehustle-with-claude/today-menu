#!/usr/bin/env bash
# 예제 35-2: sitemap.xml 이 열리는지, 형식이 맞는지, 안의 주소가 모두 열리는지 본다.
# 사용법: scripts/check-sitemap.sh https://내주소   (HEAD=1 을 붙이면 안의 주소를 하나씩 열어 본다)
set -u
BASE="${1:-http://localhost:3000}"
BASE="${BASE%/}"
fail=0
ok() { echo "통과  $1"; }
bad() { echo "문제  $1"; fail=1; }

body="$(curl -sf "$BASE/sitemap.xml")" || { bad "sitemap.xml 이 열리지 않습니다"; exit 1; }
ok "sitemap.xml 이 열립니다"

echo "$body" | head -1 | grep -q '<?xml' && ok "XML 선언이 있습니다" || bad "XML 선언이 없습니다"
echo "$body" | head -1 | grep -qi 'UTF-8' && ok "인코딩이 UTF-8 입니다" || bad "UTF-8 선언이 없습니다"

locs="$(echo "$body" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g')"
n="$(echo "$locs" | grep -c .)"
echo "정보  주소 ${n}개"
[ "$n" -gt 0 ] && ok "주소가 1개 이상입니다" || bad "주소가 없습니다"
[ "$n" -le 50000 ] && ok "주소 수가 50,000개 이하입니다" || bad "주소가 50,000개를 넘습니다"
echo "$locs" | grep -qv '^https\?://' && bad "절대 주소가 아닌 줄이 있습니다" || ok "모두 절대 주소입니다"

if [ "${HEAD:-0}" = "1" ]; then
  while read -r u; do
    code="$(curl -s -o /dev/null -w '%{http_code}' -I "$u")"
    [ "$code" = "200" ] && ok "$code $u" || bad "$code $u"
  done <<< "$locs"
fi
exit $fail
