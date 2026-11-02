#!/bin/bash
# morning-report.sh : 아침 리포트를 만들고, 형식을 검사한 뒤, 텔레그램으로 보낸다 (54장)
#   ./morning-report.sh
# 숫자 집계(build_report.py)와 전송(notify.sh)은 둘 다 토큰이 들지 않는다.
# 토큰과 chat id 는 notify.sh 가 .env 에서 읽는다. 이 스크립트는 비밀 값을 만지지 않는다.
# 전송은 notify.sh 의 DRY_RUN 기본값(1) 때문에 .env 에 DRY_RUN=0 을 적기 전에는 화면에만 나온다.
set -euo pipefail
cd "$(dirname "$0")"

TEXT="$(python3 build_report.py)" \
  || { echo "$(date '+%F %T') 숫자 집계 실패" >> report.log; exit 1; }

# 형식 검사: 첫 줄은 제목, 제목 아래에는 '- ' 줄이 하나 이상, '-' 로 시작하는 줄은 반드시 '- ' 로 시작.
# 빈 줄은 묶음 사이에서만 허용한다. 들여쓴 줄과 제목만 있는 묶음은 틀린 모양이다.
CHECK='
  NR == 1 { if ($0 == "" || $0 ~ /^-/ || $0 ~ /^[ \t]/) bad = 1; title = 1; next }
  $0 == "" { if (title) bad = 1; next }
  /^[ \t]/ { bad = 1; next }
  /^- / { title = 0; next }
  /^-/ { bad = 1; next }
  { if (title) bad = 1; title = 1 }
  END { if (title) bad = 1; exit bad }'
if ! printf '%s\n' "$TEXT" | awk "$CHECK"; then
  echo "$(date '+%F %T') 형식 오류: 제목과 '- 줄' 모양이 아니라서 보내지 않음" >> report.log
  echo "형식 오류: 보내지 않고 report.log 에 남겼습니다" >&2
  exit 1
fi

printf '%s\n' "$TEXT" | ./notify.sh -
