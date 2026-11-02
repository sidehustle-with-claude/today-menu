#!/bin/bash
# 커밋 직전에 스테이징된 내용에서 키처럼 보이는 문자열을 찾는다.

if git diff --cached | grep -E -q 'sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}'; then
  echo "차단: 키처럼 보이는 문자열이 커밋 대상에 있습니다. 확인하세요." >&2
  exit 2
fi

if git diff --cached --name-only | grep -E -q '(^|/)\.env$'; then
  echo "차단: .env 파일이 커밋 대상에 있습니다." >&2
  exit 2
fi

exit 0
