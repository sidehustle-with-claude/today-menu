#!/usr/bin/env bash
# DNS 레코드가 기대한 값으로 들어갔는지 dig로 확인한다 (30장).
# DNS를 바꾸지 않는다. 조회만 한다. 계정 비밀번호나 API 키는 필요 없다.
#
# 사용법:
#   scripts/check-dns.sh [records.csv]            기본: infra/dns/records.csv, 없으면 records.example.csv
#   DRY_RUN=1 scripts/check-dns.sh                실행할 dig 명령만 출력
#   MOCK_DNS_FILE=파일 scripts/check-dns.sh       dig 대신 파일의 "이름 종류 값" 줄을 답으로 쓴다 (테스트용)
set -u

CSV="${1:-}"
if [ -z "$CSV" ]; then
  if [ -f infra/dns/records.csv ]; then CSV=infra/dns/records.csv; else CSV=infra/dns/records.example.csv; fi
fi
[ -f "$CSV" ] || { echo "CSV 파일이 없습니다: $CSV" >&2; exit 2; }

if [ -z "${DRY_RUN:-}" ] && [ -z "${MOCK_DNS_FILE:-}" ] && ! command -v dig >/dev/null 2>&1; then
  echo "dig 명령이 없습니다. 맥·리눅스에는 보통 있고, 윈도우는 PowerShell의 Resolve-DnsName을 쓰세요." >&2
  exit 2
fi

normalize() { tr 'A-Z' 'a-z' | sed -e 's/\.$//' -e 's/^"//' -e 's/"$//'; }

lookup() { # $1=이름 $2=종류 -> 줄마다 값
  local name="$1" type="$2"
  if [ -n "${MOCK_DNS_FILE:-}" ]; then
    awk -v n="$name" -v t="$type" '$1==n && $2==t {print $3}' "$MOCK_DNS_FILE"
  else
    dig +short -t "$type" "$name"
  fi
}

fail=0
while IFS=, read -r name type expected; do
  case "$name" in ''|\#*) continue ;; esac
  name="$(echo "$name" | tr -d '[:space:]')"; type="$(echo "$type" | tr -d '[:space:]')"; expected="$(echo "$expected" | tr -d '[:space:]')"
  if [ -n "${DRY_RUN:-}" ]; then
    echo "dig +short -t $type $name   # 기대: $expected"
    continue
  fi
  actual="$(lookup "$name" "$type" | normalize | sort -u)"
  ok=1
  IFS='|' read -ra want <<< "$expected"
  for w in "${want[@]}"; do
    w_norm="$(echo "$w" | normalize)"
    echo "$actual" | grep -qxF "$w_norm" || ok=0
  done
  if [ "$ok" -eq 1 ]; then
    echo "OK    $type $name"
  elif [ -z "$actual" ]; then
    echo "빈 답 $type $name  (아직 반영 전이거나 레코드가 없습니다. 기대: $expected)"
    fail=1
  else
    echo "다름  $type $name"
    echo "      기대: $expected"
    echo "      실제: $(echo "$actual" | tr '\n' ' ')"
    fail=1
  fi
done < "$CSV"

if [ -n "${DRY_RUN:-}" ]; then exit 0; fi
if [ "$fail" -ne 0 ]; then
  echo "틀린 곳은 등록기관의 DNS 편집 화면에서 사람이 직접 고칩니다. 반영에는 최대 하루가 걸릴 수 있습니다."
  exit 1
fi
echo "모든 레코드가 기대한 값과 같습니다."
