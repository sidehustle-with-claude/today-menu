#!/usr/bin/env bash
# 스토어 제출 전 자동 점검 (39장). 파일을 읽기만 한다. 값은 출력하지 않고 파일:줄만 알린다.
# 사용: bash scripts/presubmit-check.sh [저장소 루트]
set -u
ROOT="${1:-.}"
cd "$ROOT" || exit 2
fail=0

report() { echo "  $1"; fail=1; }

echo "[1] 자리표시 주소와 문구"
hits=$(grep -rnE 'example\.com|여기에-|XXXXXXXX' mobile/app.json mobile/app.config.ts mobile/src mobile/App.tsx 2>/dev/null | grep -v '\.test\.ts' | grep -vE '^[^:]+:[0-9]+:[[:space:]]*//' | cut -d: -f1,2)
if [ -n "$hits" ]; then echo "$hits" | while read -r l; do echo "  남아 있음: $l"; done; fail=1; else echo "  없음"; fi

echo "[2] 하드코딩된 실제 광고 단위 ID (구글 공식 샘플 ID 제외)"
hits=$(grep -rnoE 'ca-app-pub-[0-9]{16}[~/][0-9]{10}' mobile/src mobile/App.tsx mobile/app.config.ts mobile/app.json 2>/dev/null | grep -v '\.test\.ts' | grep -v 'ca-app-pub-3940256099942544' | cut -d: -f1,2)
if [ -n "$hits" ]; then echo "$hits" | while read -r l; do echo "  실제 ID로 보임: $l"; done; fail=1; else echo "  없음"; fi

echo "[3] 개인정보처리방침·문의 링크"
if [ -f mobile/src/links.ts ] && grep -q 'PRIVACY_POLICY_URL' mobile/src/links.ts && grep -q 'SUPPORT_URL' mobile/src/links.ts; then echo "  links.ts 있음"; else report "mobile/src/links.ts 에 PRIVACY_POLICY_URL, SUPPORT_URL 이 없음"; fi
if grep -rq 'PRIVACY_POLICY_URL' mobile/src/screens 2>/dev/null; then echo "  화면에서 사용함"; else report "화면에서 개인정보처리방침 링크를 쓰지 않음"; fi

echo "[4] 앱 이름 30자 이내"
name=$(python3 -c "import json;print(json.load(open('mobile/app.json'))['expo']['name'])" 2>/dev/null)
if [ -z "$name" ]; then report "app.json 에서 name 을 읽지 못함"; elif [ "${#name}" -le 30 ]; then echo "  ${#name}자"; else report "앱 이름이 ${#name}자 (30자 초과)"; fi

echo "[5] 개인정보 항목 문서"
[ -f docs/app-data-inventory.md ] && echo "  docs/app-data-inventory.md 있음" || report "docs/app-data-inventory.md 없음"

echo
if [ "$fail" -eq 0 ]; then echo "결과: 통과"; else echo "결과: 고칠 것이 있음"; fi
exit "$fail"
