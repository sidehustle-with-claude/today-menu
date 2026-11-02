#!/usr/bin/env bash
# 예제 35-1: 도메인에 서치콘솔 확인용 TXT 레코드가 들어갔는지 본다. DNS 는 바꾸지 않고 읽기만 한다.
# 사용법: scripts/check-dns-txt.sh example.com
set -u
domain="${1:-}"
if [ -z "$domain" ]; then echo "사용법: $0 도메인"; exit 2; fi
if ! command -v dig >/dev/null 2>&1; then echo "dig 명령이 없습니다. 30장에서 쓴 dig 를 먼저 준비하세요."; exit 2; fi

out="$(dig "$domain" +noall +answer -t TXT)"
echo "$out"
if echo "$out" | grep -q 'google-site-verification='; then
  echo "통과  google-site-verification 레코드가 보입니다 (값은 서치콘솔 화면의 값과 직접 맞춰 보세요)"
else
  echo "문제  google-site-verification 레코드가 보이지 않습니다. 반영에 시간이 걸릴 수 있습니다"
  exit 1
fi
if echo "$out" | grep -E 'google-site-verification=' | grep -Eq '"\s|\s"\s*$|  '; then
  echo "주의  따옴표나 공백이 값 안에 끼었는지 확인하세요"
fi
