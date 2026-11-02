#!/bin/bash
# inject-decisions.sh : SessionStart 훅. 지금 저장소에 맞는 결정 제목만 컨텍스트에 넣는다.
# 본문까지 넣지 않는다. 필요하면 클로드가 파일을 연다.
# 종료 코드는 늘 0 이다(세션 시작을 막지 않는다).
cat >/dev/null 2>&1 || true

HERE="$(cd "$(dirname "$0")/.." && pwd)"
WIKI="${WIKI_DIR:-$HERE/decisions}"
PROJECT="${CLAUDE_PROJECT_DIR:-$PWD}"
REPO="${WIKI_REPO:-$(basename "$(git -C "$PROJECT" rev-parse --show-toplevel 2>/dev/null || echo "$PROJECT")")}"

echo "아래는 이미 정해진 결정이다. 새 제안 전에 확인한다."
for dir in "$WIKI/_global" "$WIKI/$REPO"; do
  [ -d "$dir" ] || continue
  for f in "$dir"/*.md; do
    [ -f "$f" ] || continue
    # 폐기된 결정은 넣지 않는다.
    grep -q '^status: retired' "$f" && continue
    echo "- $(basename "$dir")/$(basename "$f" .md)"
  done
done
exit 0
