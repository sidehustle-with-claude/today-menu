#!/bin/sh
# pre-commit 검사가 가짜 키를 막는지 임시 저장소에서 시험한다. 진짜 키는 쓰지 않는다.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
TMP=$(mktemp -d)
cd "$TMP"
git init -q
git config core.hooksPath .git/hooks
git config user.name tester
git config user.email tester@example.com
cp "$HERE/pre-commit" .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "const key = 'sk-abcdefghijklmnop1234';" > fake.js
git add fake.js
if git commit -q -m "test: 가짜 키" 2>/dev/null; then
  echo "실패: 가짜 키가 커밋됐습니다."
  exit 1
fi
echo "통과: 가짜 키 커밋이 막혔습니다."
rm -rf "$TMP"
