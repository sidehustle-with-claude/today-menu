#!/bin/bash
# 예제 53-1: 주소 응답 확인. 이상이 있을 때만 메시지를 출력하고 종료 코드 1로 끝낸다.
# 쓰는 법
#   scripts/check-deploy.sh https://내-도메인.example
#   DEPLOY_URL=https://내-도메인.example scripts/check-deploy.sh
# 정상이면 아무것도 출력하지 않는다(토큰 0, 로그도 조용히).
# NOTIFY=1 이면 이상일 때 notify.sh 로 알림을 보낸다(notify.sh 는 DRY_RUN 이 기본이라 실제 전송은 .env 에서 켠다).

URL="${1:-${DEPLOY_URL:-https://내-도메인.example}}"

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${CHECK_TIMEOUT:-10}" "$URL")
# curl 이 연결 자체를 못 하면 000 이 나온다.
if [ "$code" != "200" ]; then
  msg="today-menu 응답 이상: HTTP $code"
  echo "$msg"
  if [ "${NOTIFY:-0}" = "1" ]; then
    HERE="$(cd "$(dirname "$0")/.." && pwd)"
    [ -x "$HERE/notify.sh" ] && "$HERE/notify.sh" "배포 확인 실패" "$msg" "주소: $URL"
  fi
  exit 1
fi
