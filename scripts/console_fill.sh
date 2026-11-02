#!/bin/bash
# console_fill.sh : 이미 로그인해 둔 내 크롬 탭의 '앱 소개' 칸과 '스크린샷' 칸을 채운다 (43.8)
#
# 사용: bash scripts/console_fill.sh store/intro.txt store/shots
#
# 하는 일은 입력뿐이다. 제출, 저장 후 심사 요청, 삭제, 결제 버튼은 코드에 아예 없다.
#   (1) 로그인은 시도하지 않는다. 로그인 화면이면 "로그인은 사람이 해 주세요" 하고 멈춘다.
#   (2) 칸을 못 찾으면 어떤 칸이 없는지 출력하고 에러(종료 코드 1)로 멈춘다.
#   (3) 제출 버튼은 누르지 않는다. 마지막에 사람이 화면을 보고 직접 누른다.
#   (4) config/allowed-domains.txt 에 없는 사이트면 실행하지 않는다.
#   (5) 값은 파일에서 읽는다. 스크립트에 박지 않는다.
#
# DRY_RUN=1 (기본값): 탭 주소와 칸이 있는지 읽어서 보고만 하고, 아무것도 채우지 않는다.
# 실제로 채우려면 DRY_RUN=0 으로 실행한다.
#
# 사전 준비 (사람 몫): 크롬 메뉴 '보기 > 개발자 > Apple 이벤트에서 JavaScript 허용'을 직접 켠다.
# 칸 위치(선택자)는 콘솔 화면 구조에 맞춰 환경변수나 아래 기본값을 고친다.

set -u

INTRO_FILE="${1:-}"
SHOTS_DIR="${2:-}"
DRY_RUN="${DRY_RUN:-1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ALLOWED_FILE="${ALLOWED_FILE:-$ROOT/config/allowed-domains.txt}"
INTRO_SELECTOR="${INTRO_SELECTOR:-textarea[name='description']}"
SHOTS_SELECTOR="${SHOTS_SELECTOR:-input[type='file'][name='screenshots']}"
MAX_SHOTS="${MAX_SHOTS:-8}"
MAX_SHOT_KB="${MAX_SHOT_KB:-700}"
PAUSE_SECONDS="${PAUSE_SECONDS:-1}"

die() { echo "멈춤: $*" >&2; exit 1; }

[ -n "$INTRO_FILE" ] && [ -n "$SHOTS_DIR" ] || die "사용법: bash scripts/console_fill.sh store/intro.txt store/shots"
[ -f "$INTRO_FILE" ] || die "소개 글 파일이 없습니다: $INTRO_FILE"
[ -d "$SHOTS_DIR" ] || die "스크린샷 폴더가 없습니다: $SHOTS_DIR"
[ -f "$ALLOWED_FILE" ] || die "허용 도메인 목록이 없습니다: $ALLOWED_FILE"
command -v osascript >/dev/null 2>&1 || die "osascript 가 없습니다 (맥에서만 동작합니다)"

# 크롬에서 JS 를 실행한다. JS 는 표준 입력으로 받는다 (인자 길이 제한을 피하려고).
chrome_js() {
  local js escaped
  js="$(cat)"
  escaped="${js//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"
  printf 'tell application "Google Chrome" to execute front window'"'"'s active tab javascript "%s"\n' "$escaped" | osascript
}

# ---- (4) 허용 도메인 검사: 가장 먼저 한다 ----
TAB_URL="$(osascript -e 'tell application "Google Chrome" to get URL of active tab of front window' 2>/dev/null)" \
  || die "크롬의 현재 탭 주소를 읽지 못했습니다"
HOST="${TAB_URL#*://}"; HOST="${HOST%%/*}"; HOST="${HOST%%:*}"; HOST="${HOST%%\?*}"
[ -n "$HOST" ] || die "탭 주소에서 도메인을 찾지 못했습니다: $TAB_URL"

allowed=0
while IFS= read -r line; do
  line="${line%%#*}"; line="${line//[[:space:]]/}"
  [ -z "$line" ] && continue
  if [ "$HOST" = "$line" ]; then allowed=1; break; fi
done < "$ALLOWED_FILE"
[ "$allowed" = 1 ] || die "허용 도메인이 아닙니다: $HOST (config/allowed-domains.txt 에 없음). 아무것도 하지 않았습니다."
echo "도메인 확인: $HOST"

# ---- 로그인 화면이면 멈춘다. 로그인은 시도하지 않는다 ----
state="$(chrome_js <<'JS'
(function () {
  var pw = document.querySelector("input[type='password']");
  var path = location.pathname.toLowerCase();
  if (pw || /login|signin|sign-in|auth/.test(path)) { return 'LOGIN'; }
  return 'OK';
})()
JS
)" || die "크롬에서 JavaScript 를 실행하지 못했습니다. 'Apple 이벤트에서 JavaScript 허용'이 켜져 있는지 확인하세요."
[ "$state" != "LOGIN" ] || die "로그인 화면입니다. 로그인은 사람이 해 주세요."

# ---- (2) 칸이 있는지 먼저 확인한다. 없으면 어떤 칸이 없는지 말하고 멈춘다 ----
missing="$(chrome_js <<JS
(function () {
  var miss = [];
  if (!document.querySelector("$INTRO_SELECTOR")) { miss.push('앱 소개 칸 ($INTRO_SELECTOR)'); }
  if (!document.querySelector("$SHOTS_SELECTOR")) { miss.push('스크린샷 칸 ($SHOTS_SELECTOR)'); }
  return miss.join(' / ');
})()
JS
)"
if [ -n "$missing" ]; then
  echo "찾지 못한 칸: $missing" >&2
  die "콘솔 화면 구조가 바뀐 것 같습니다. 화면을 보고 선택자를 고치세요."
fi
echo "칸 확인: 앱 소개 칸, 스크린샷 칸"

# ---- 올릴 스크린샷 목록 (이름순, 크기 제한) ----
shots=()
while IFS= read -r f; do shots+=("$f"); done < <(find "$SHOTS_DIR" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | LC_ALL=C sort)
[ "${#shots[@]}" -le "$MAX_SHOTS" ] || die "스크린샷이 ${#shots[@]}장입니다. 한 번에 $MAX_SHOTS 장까지만 올립니다."
for f in "${shots[@]}"; do
  kb=$(( ($(wc -c < "$f") + 1023) / 1024 ))
  [ "$kb" -le "$MAX_SHOT_KB" ] || die "파일이 너무 큽니다: $f (${kb}KB > ${MAX_SHOT_KB}KB). 줄여서 다시 시도하세요."
done

echo "소개 글: $INTRO_FILE ($(wc -c < "$INTRO_FILE") 바이트)"
echo "스크린샷: ${#shots[@]}장"
for f in "${shots[@]}"; do echo "  - $f"; done

if [ "$DRY_RUN" != "0" ]; then
  echo "[DRY_RUN] 읽기만 했습니다. 실제로 채우려면 DRY_RUN=0 으로 실행하세요."
  exit 0
fi

# ---- 소개 글 입력 (값은 base64 로 넘겨 따옴표 문제를 피한다) ----
intro_b64="$(base64 < "$INTRO_FILE" | tr -d '\n')"
chrome_js <<JS >/dev/null || die "소개 글 입력에 실패했습니다"
(function () {
  var el = document.querySelector("$INTRO_SELECTOR");
  var text = decodeURIComponent(escape(atob('$intro_b64')));
  el.focus();
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return 'ok';
})()
JS
echo "입력함: 앱 소개 칸"

# ---- 스크린샷 올리기: 파일마다 DataTransfer 에 쌓고 마지막에 한 번에 넣는다 ----
if [ "${#shots[@]}" -gt 0 ]; then
  chrome_js <<< "(function(){ window.__consoleFillDT = new DataTransfer(); return 'ok'; })()" >/dev/null || die "업로드 준비에 실패했습니다"
  for f in "${shots[@]}"; do
    name="$(basename "$f")"
    case "$name" in *.png|*.PNG) mime="image/png" ;; *) mime="image/jpeg" ;; esac
    b64="$(base64 < "$f" | tr -d '\n')"
    chrome_js <<JS >/dev/null || die "업로드 실패: $name"
(function () {
  var bin = atob('$b64');
  var arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) { arr[i] = bin.charCodeAt(i); }
  window.__consoleFillDT.items.add(new File([arr], '$name', { type: '$mime' }));
  return 'ok';
})()
JS
    sleep "$PAUSE_SECONDS"
  done
  chrome_js <<JS >/dev/null || die "스크린샷 칸에 넣지 못했습니다"
(function () {
  var el = document.querySelector("$SHOTS_SELECTOR");
  el.files = window.__consoleFillDT.files;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return 'ok';
})()
JS
  echo "넣음: 스크린샷 ${#shots[@]}장 (순서: 이름순)"
fi

echo "끝: 입력만 했습니다. 제출 버튼은 누르지 않았습니다. 화면을 확인하고 사람이 직접 누르세요."
