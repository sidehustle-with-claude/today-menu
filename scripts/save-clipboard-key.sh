#!/bin/bash
# save-clipboard-key.sh NAME : 클립보드의 값을 .env 의 NAME 에 저장한다 (44.4)
# 값은 화면에 찍지 않는다. 확인용으로 앞 4글자만 보여 주고, 끝나면 클립보드를 비운다.
#
# 사용: bash scripts/save-clipboard-key.sh DATA_GO_KR_KEY
#   1) 키를 비밀번호 관리자나 서비스 화면에서 복사한다 (폰에서 복사해도 된다)
#   2) 위 명령을 실행한다
#
# 이미 같은 이름이 .env 에 있으면 덮어쓰지 않고 알려 준 뒤 멈춘다.
# 다른 파일에 쓰려면 ENV_FILE=경로 를 앞에 붙인다.

set -u
NAME="${1:-}"
ENV_FILE="${ENV_FILE:-$(cd "$(dirname "$0")/.." && pwd)/.env}"

die() { echo "멈춤: $*" >&2; exit 1; }

case "$NAME" in
  [A-Z]*) ;;
  *) die "사용법: bash scripts/save-clipboard-key.sh 이름 (예: DATA_GO_KR_KEY, 대문자와 밑줄만)" ;;
esac
case "$NAME" in
  *[!A-Z0-9_]*) die "이름은 대문자, 숫자, 밑줄만 쓸 수 있습니다: $NAME" ;;
esac
command -v pbpaste >/dev/null 2>&1 || die "pbpaste 가 없습니다 (맥에서만 동작합니다)"

if [ -f "$ENV_FILE" ] && grep -q "^${NAME}=" "$ENV_FILE"; then
  die "$ENV_FILE 에 $NAME 이(가) 이미 있습니다. 덮어쓰지 않았습니다. 바꾸려면 .env 에서 그 줄을 직접 지우세요."
fi

KEY="$(pbpaste)"
# 어떤 경우로 끝나도 변수와 클립보드를 비운다
cleanup() { unset KEY; pbcopy < /dev/null; }
trap cleanup EXIT

[ -n "$KEY" ] || die "클립보드가 비어 있습니다. 키를 먼저 복사하세요."
case "$KEY" in
  *$'\n'*) die "여러 줄이 복사돼 있습니다. 키 한 줄만 복사하세요." ;;
esac

# 마지막 줄 끝에 줄바꿈이 없으면 붙여서 줄이 이어지지 않게 한다
if [ -s "$ENV_FILE" ] && [ -n "$(tail -c 1 "$ENV_FILE")" ]; then
  printf '\n' >> "$ENV_FILE"
fi
printf '%s=%s\n' "$NAME" "$KEY" >> "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "저장함: $NAME (앞 4글자 ${KEY:0:4}…, 총 ${#KEY}글자)"
echo "클립보드를 비웠습니다."
