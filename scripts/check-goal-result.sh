#!/bin/bash
# /goal이 끝난 뒤 내 눈으로 확인하는 단계(52장 '결과 확인하기')를 한 번에 돌린다.
#   1) npm test  2) git status  3) git diff --stat  4) 테스트 파일이 바뀌었는지
# 쓰는 법: scripts/check-goal-result.sh
# 읽기만 하는 확인이라 파일을 고치지 않는다. 테스트 파일이 바뀌었거나 테스트가 실패하면 종료 코드 1.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 1

problem=0

echo "== 1. npm test =="
if npm test; then
  echo "-> 테스트 통과"
else
  echo "-> 테스트 실패 (종료 코드 $?)"
  problem=1
fi

echo
echo "== 2. git status =="
git status --short || problem=1

echo
echo "== 3. git diff --stat =="
git diff --stat || problem=1

echo
echo "== 4. 테스트 파일 변경 확인 =="
# 목표에 "테스트 파일은 수정하지 않는다"를 적었으므로 이 목록이 비어 있어야 한다.
changed=$( { git diff --name-only; git diff --name-only --cached; git ls-files --others --exclude-standard; } 2>/dev/null \
  | sort -u | grep -E '(^|/)(tests?|__tests__)/|\.(test|spec)\.[cm]?[jt]sx?$|\.test\.sh$' )
if [ -n "$changed" ]; then
  echo "-> 테스트 파일이 바뀌었습니다. 목표의 제약을 어겼는지 확인하세요:"
  echo "$changed" | sed 's/^/   /'
  problem=1
else
  echo "-> 테스트 파일은 그대로입니다."
fi

echo
if [ "$problem" -eq 0 ]; then
  echo "결과: 확인할 문제가 없습니다. 배포 여부는 변경분을 읽고 사람이 정합니다."
else
  echo "결과: 확인할 문제가 있습니다. 위 항목을 보세요."
fi
exit "$problem"
