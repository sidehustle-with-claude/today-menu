#!/bin/bash
# clipboard-otp.sh check|clear : 폰에서 복사한 인증번호를 다루는 도우미 (44.3, 44.5)
#
#   check : 클립보드가 숫자 6자리인지만 확인한다. 값은 출력하지 않는다.
#   clear : 클립보드를 비운다.
#
# 인증번호를 받아 복사하는 일은 사람이 한다. 이 스크립트는 문자 앱이나 인증 앱을 읽지 않는다.
# 입력칸에 넣는 일은 클로드(43장의 크롬 조작)가 하고, 확인 버튼 앞에서 멈춘다.

set -u
case "${1:-}" in
  check)
    command -v pbpaste >/dev/null 2>&1 || { echo "pbpaste 가 없습니다 (맥에서만 동작합니다)" >&2; exit 2; }
    value="$(pbpaste)"
    if [[ "$value" =~ ^[0-9]{6}$ ]]; then
      echo "숫자 6자리입니다."
      unset value
      exit 0
    fi
    unset value
    echo "숫자 6자리가 아닙니다. 다시 복사해 주세요." >&2
    exit 1
    ;;
  clear)
    pbcopy < /dev/null
    echo "클립보드를 비웠습니다."
    ;;
  *)
    echo "사용법: bash scripts/clipboard-otp.sh check|clear" >&2
    exit 2
    ;;
esac
