#!/usr/bin/env bash
# AWS 키처럼 보이는 문자열이 파일에 있는지 검사한다 (28장).
# 값은 절대 출력하지 않고 파일 이름과 줄 번호, 종류만 보여 준다.
# 사용법: scripts/check-aws-keys.sh [검사할 폴더, 기본 .]
set -u

TARGET="${1:-.}"
found=0

# 이름 = 정규식 (ERE)
patterns=(
  "액세스 키 ID(AKIA/ASIA로 시작)=\\b(AKIA|ASIA)[0-9A-Z]{16}\\b"
  "시크릿 키 대입(aws_secret_access_key)=aws_secret_access_key[[:space:]]*[=:][[:space:]]*[\"']?[A-Za-z0-9/+=]{30,}"
  "액세스 키 대입(aws_access_key_id)=aws_access_key_id[[:space:]]*[=:][[:space:]]*[\"']?(AKIA|ASIA)[0-9A-Z]{16}"
)

for entry in "${patterns[@]}"; do
  name="${entry%%=*}"
  regex="${entry#*=}"
  # -I 이진 파일 건너뜀, -o 가 아닌 -n 만 써서 일치한 문자열 자체는 출력하지 않는다.
  while IFS=: read -r file line _; do
    [ -z "$file" ] && continue
    echo "발견: $file:$line  ($name)"
    found=1
  done < <(grep -rInE --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.expo --exclude=check-aws-keys.sh "$regex" "$TARGET" 2>/dev/null)
done

# .gitignore에 .aws 관련 항목이 있는지 확인
if [ -f "$TARGET/.gitignore" ]; then
  if ! grep -qE '^\.?/?\.aws(/|$)|credentials' "$TARGET/.gitignore"; then
    echo "참고: $TARGET/.gitignore 에 .aws 폴더나 credentials 항목이 없습니다."
  fi
fi

if [ "$found" -eq 0 ]; then
  echo "AWS 키처럼 보이는 문자열을 찾지 못했습니다."
  exit 0
fi
echo "위 위치를 확인하세요. 키가 실제로 노출됐다면 즉시 비활성화하고 삭제한 뒤 새로 만드세요."
exit 1
