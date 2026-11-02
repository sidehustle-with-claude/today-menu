#!/bin/bash
# import-latest-photo.sh : 아이폰에서 에어드롭으로 받은 최신 사진을 public/images/ 로 복사한다 (44.6)
# 원본은 지우지 않는다. 이름은 sample-1.jpg, sample-2.jpg ... 처럼 비어 있는 번호로 붙인다.
# 위치 정보(GPS)가 사진에 들어 있을 수 있어서, exiftool 이 있으면 복사본에서 지운다.
#
# 사용: bash scripts/import-latest-photo.sh
# 바꾸고 싶으면: DOWNLOADS_DIR=경로 DEST_DIR=경로 bash scripts/import-latest-photo.sh

set -u
DOWNLOADS_DIR="${DOWNLOADS_DIR:-$HOME/Downloads}"
DEST_DIR="${DEST_DIR:-$(cd "$(dirname "$0")/.." && pwd)/public/images}"

die() { echo "멈춤: $*" >&2; exit 1; }
[ -d "$DOWNLOADS_DIR" ] || die "폴더가 없습니다: $DOWNLOADS_DIR"

latest=""
while IFS= read -r f; do latest="$f"; break; done < <(
  find "$DOWNLOADS_DIR" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -exec ls -t {} + 2>/dev/null
)
[ -n "$latest" ] || die "$DOWNLOADS_DIR 에 사진(jpg, jpeg, png)이 없습니다. 에어드롭이 끝났는지 확인하세요."

ext="${latest##*.}"; ext="$(printf '%s' "$ext" | tr 'A-Z' 'a-z')"
[ "$ext" = "jpeg" ] && ext="jpg"
mkdir -p "$DEST_DIR"
n=1
while [ -e "$DEST_DIR/sample-$n.jpg" ] || [ -e "$DEST_DIR/sample-$n.png" ]; do n=$((n + 1)); done
dest="$DEST_DIR/sample-$n.$ext"

cp "$latest" "$dest"
if command -v exiftool >/dev/null 2>&1; then
  exiftool -q -overwrite_original -gps:all= "$dest" && echo "위치 정보를 지웠습니다."
else
  echo "알림: exiftool 이 없어 위치 정보는 그대로입니다. 공개하기 전에 직접 확인하세요."
fi
echo "복사함: $(basename "$latest") -> $dest (원본은 그대로 둠)"
