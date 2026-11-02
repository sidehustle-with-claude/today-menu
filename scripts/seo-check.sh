#!/usr/bin/env bash
# 예제 32-1: 배포한 주소의 기본기를 curl 로 점검한다. 사용법: scripts/seo-check.sh https://내주소
set -u
BASE="${1:-${SITE_URL:-http://localhost:3000}}"
BASE="${BASE%/}"
fail=0

check() { # 이름 조건(0=통과)
  if [ "$2" -eq 0 ]; then echo "통과  $1"; else echo "문제  $1"; fail=1; fi
}

html="$(curl -sf "$BASE/")" ; check "홈이 열린다" $?
robots="$(curl -sf "$BASE/robots.txt")" ; check "robots.txt 가 열린다" $?
sitemap="$(curl -sf "$BASE/sitemap.xml")" ; check "sitemap.xml 이 열린다" $?

echo "$robots" | grep -Eqi '^Disallow:[[:space:]]*/[[:space:]]*$'; [ $? -ne 0 ]; check "robots.txt 에 Disallow: / 가 없다" $?
echo "$robots" | grep -qi '^Sitemap:'; check "robots.txt 에 Sitemap 줄이 있다" $?
echo "$sitemap" | grep -Eqi '<priority>|<changefreq>'; [ $? -ne 0 ]; check "사이트맵에 priority/changefreq 가 없다" $?
echo "$html" | grep -qi '<title>'; check "홈에 title 이 있다" $?
echo "$html" | grep -qi 'name="description"'; check "홈에 meta description 이 있다" $?
echo "$html" | grep -qi 'name="viewport"'; check "모바일 viewport 메타가 있다" $?
echo "$html" | grep -qi 'noindex'; [ $? -ne 0 ]; check "홈에 noindex 가 없다" $?

exit $fail
