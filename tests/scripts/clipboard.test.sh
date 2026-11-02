#!/bin/bash
# 44장 스크립트 시험: 가짜 pbpaste/pbcopy(파일 한 개가 클립보드)로 확인한다. 실제 클립보드는 건드리지 않는다.
# 사용: bash tests/scripts/clipboard.test.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/dl" "$T/dest"
export CLIP="$T/clip"
printf '#!/bin/bash\ncat "$CLIP"\n' > "$T/bin/pbpaste"
printf '#!/bin/bash\ncat > "$CLIP"\n' > "$T/bin/pbcopy"
chmod +x "$T/bin/"*
export PATH="$T/bin:$PATH"
fail=0; check() { if [ "$2" = "$3" ]; then echo "통과: $1"; else echo "실패: $1 (기대 $2, 실제 $3)"; fail=1; fi; }
export ENV_FILE="$T/.env"

printf 'abcd1234SECRETVALUE' > "$CLIP"
out="$(bash "$ROOT/scripts/save-clipboard-key.sh" MY_KEY 2>&1)"; check "키 저장 성공" 0 $?
check ".env 에 한 줄 기록" "MY_KEY=abcd1234SECRETVALUE" "$(cat "$ENV_FILE")"
case "$out" in *SECRETVALUE*) echo "실패: 출력에 전체 값이 나옴"; fail=1 ;; *) echo "통과: 출력에 전체 값 없음" ;; esac
case "$out" in *abcd*) echo "통과: 앞 4글자 표시" ;; *) echo "실패: 앞 4글자 표시"; fail=1 ;; esac
check "클립보드 비움" "0" "$(wc -c < "$CLIP" | tr -d ' ')"
check ".env 권한 600" "600" "$(stat -f %Lp "$ENV_FILE" 2>/dev/null || stat -c %a "$ENV_FILE")"

printf 'other' > "$CLIP"
bash "$ROOT/scripts/save-clipboard-key.sh" MY_KEY >/dev/null 2>&1; check "이미 있는 이름은 거부" 1 $?
check "거부해도 기존 값 유지" "MY_KEY=abcd1234SECRETVALUE" "$(cat "$ENV_FILE")"
printf '' > "$CLIP"
bash "$ROOT/scripts/save-clipboard-key.sh" NEW_KEY >/dev/null 2>&1; check "빈 클립보드는 거부" 1 $?
printf 'a\nb' > "$CLIP"
bash "$ROOT/scripts/save-clipboard-key.sh" NEW_KEY >/dev/null 2>&1; check "여러 줄은 거부" 1 $?
printf 'x' > "$CLIP"
bash "$ROOT/scripts/save-clipboard-key.sh" bad-name >/dev/null 2>&1; check "잘못된 이름은 거부" 1 $?
printf -- '-' > "$ENV_FILE.tmp"; printf 'NOEOL=1' > "$ENV_FILE"; printf 'zzzz9999' > "$CLIP"
bash "$ROOT/scripts/save-clipboard-key.sh" SECOND >/dev/null 2>&1
check "줄바꿈 없는 .env 에도 줄이 나뉨" "NOEOL=1 SECOND=zzzz9999" "$(tr '\n' ' ' < "$ENV_FILE" | sed 's/ $//')"

printf '123456' > "$CLIP"; out="$(bash "$ROOT/scripts/clipboard-otp.sh" check 2>&1)"; check "6자리 숫자 통과" 0 $?
case "$out" in *123456*) echo "실패: 값이 출력됨"; fail=1 ;; *) echo "통과: 값 출력 없음" ;; esac
printf '12345' > "$CLIP"; bash "$ROOT/scripts/clipboard-otp.sh" check >/dev/null 2>&1; check "5자리는 거부" 1 $?
printf '12345a' > "$CLIP"; bash "$ROOT/scripts/clipboard-otp.sh" check >/dev/null 2>&1; check "숫자 아닌 글자는 거부" 1 $?
printf '123456' > "$CLIP"; bash "$ROOT/scripts/clipboard-otp.sh" clear >/dev/null; check "clear 로 비움" 0 "$(wc -c < "$CLIP" | tr -d ' ')"

printf 'old' > "$T/dl/a.jpg"; sleep 1; printf 'new' > "$T/dl/b.PNG"; printf 'txt' > "$T/dl/c.txt"
DOWNLOADS_DIR="$T/dl" DEST_DIR="$T/dest" bash "$ROOT/scripts/import-latest-photo.sh" >/dev/null 2>&1; check "최신 사진 복사" 0 $?
check "가장 최근 파일이 sample-1.png" "new" "$(cat "$T/dest/sample-1.png" 2>/dev/null)"
check "원본 유지" "new" "$(cat "$T/dl/b.PNG")"
DOWNLOADS_DIR="$T/dl" DEST_DIR="$T/dest" bash "$ROOT/scripts/import-latest-photo.sh" >/dev/null 2>&1
[ -e "$T/dest/sample-2.png" ] && echo "통과: 두 번째는 sample-2" || { echo "실패: 번호 증가"; fail=1; }
mkdir "$T/empty"; DOWNLOADS_DIR="$T/empty" DEST_DIR="$T/dest" bash "$ROOT/scripts/import-latest-photo.sh" >/dev/null 2>&1; check "사진이 없으면 멈춤" 1 $?
exit $fail
