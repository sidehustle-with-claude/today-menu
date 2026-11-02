#!/bin/bash
# telegram-report 스킬의 send.sh 검증. 가짜 curl 로 실제 전송 경로를 보고, 인터넷에는 나가지 않는다.
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
SEND="$HERE/examples/home/.claude/skills/telegram-report/scripts/send.sh"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/p"
cat > "$T/bin/curl" <<'N'
#!/bin/bash
{ echo "ARGS: $*"; echo "STDIN: $(cat)"; } > "$FAKE_CURL_LOG"
N
chmod +x "$T/bin/curl"
export PATH="$T/bin:$PATH" FAKE_CURL_LOG="$T/curl.log"
cd "$T/p" || exit 1
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (기대 $3, 실제 $2)"; fi; }
ok_text() { printf '%s\n' "$@" | "$SEND" >"$T/out" 2>"$T/err"; }

ok_text "제목" "- 줄 하나" "- 줄 둘"; check "정상 글, DRY_RUN 기본" $? 0
grep -q "DRY_RUN=1" "$T/out"; check "DRY_RUN 안내" $? 0
[ ! -f "$FAKE_CURL_LOG" ]; check "DRY_RUN 은 curl 안 부름" $? 0
printf '\n\n제목\n- 줄\n\n\n' | "$SEND" >/dev/null 2>&1; check "앞뒤 빈 줄 무시" $? 0
printf '어제\n- 가\n\n오늘 할 일\n- 나\n' | "$SEND" >/dev/null 2>&1; check "빈 줄로 나눈 묶음 둘(54장 형식)" $? 0
ok_text "- 제목아님" "- 줄"; check "첫 줄이 - 면 거부" $? 1
ok_text "제목" "본문 줄"; check "'- ' 없는 줄 거부" $? 1
ok_text "제목" "-붙은줄"; check "'-줄' 거부" $? 1
ok_text "제목" "  - 들여씀"; check "들여쓴 줄 거부" $? 1
ok_text "제목만"; check "제목만 있으면 거부" $? 1
printf '제목\n\n- 줄\n' | "$SEND" >/dev/null 2>&1; check "제목 바로 아래 빈 줄 거부" $? 1
printf '\n\n' | "$SEND" >/dev/null 2>&1; check "빈 입력 거부" $? 1

printf 'TG_TOKEN=fake-token-123\nTG_CHAT_ID=999\nDRY_RUN=0\n' > .env
ok_text "제목" "- 줄 하나"; check "DRY_RUN=0 + 가짜 토큰: 전송 경로" $? 0
grep -q "STDIN: url = \"https://api.telegram.org/botfake-token-123/sendMessage\"" "$FAKE_CURL_LOG"; check "토큰은 표준입력으로만 전달" $? 0
! grep -q "ARGS:.*fake-token" "$FAKE_CURL_LOG"; check "인자(ps)에 토큰 없음" $? 0
grep -q "chat_id=999" "$FAKE_CURL_LOG"; check "chat_id 전달" $? 0
grep -q "text=제목" "$FAKE_CURL_LOG"; check "본문 전달" $? 0
! grep -q "fake-token" "$T/out" "$T/err"; check "화면에 토큰 안 찍힘" $? 0
printf 'TG_BOT_TOKEN=bot-name-token\nTG_CHAT_ID=1\nDRY_RUN=0\n' > .env
ok_text "제목" "- 줄"; grep -q "botbot-name-token" "$FAKE_CURL_LOG"; check "TG_BOT_TOKEN 이름도 받음" $? 0
printf 'TG_CHAT_ID=1\nDRY_RUN=0\n' > .env
ok_text "제목" "- 줄"; check "토큰 없으면 1" $? 1
printf 'TG_TOKEN=t\nTG_CHAT_ID=1\nDRY_RUN=0\n' > .env
DRY_RUN=1 bash -c 'printf "제목\n- 줄\n" | "$0"' "$SEND" >"$T/out" 2>&1; grep -q "DRY_RUN=1" "$T/out"; check "호출할 때 DRY_RUN=1 이 .env 보다 우선" $? 0
mkdir -p "$T/other"; printf 'TG_TOKEN=other\nTG_CHAT_ID=2\nDRY_RUN=0\n' > "$T/other/.env"
rm -f "$FAKE_CURL_LOG"; rm .env
TELEGRAM_ENV="$T/other/.env" bash -c 'printf "제목\n- 줄\n" | "$0"' "$SEND" >/dev/null 2>&1; grep -q "botother" "$FAKE_CURL_LOG"; check "TELEGRAM_ENV 로 다른 .env" $? 0

D="$HERE/examples/home/.claude/skills/telegram-report"
[ "$(wc -l < "$D/SKILL.md")" -le 500 ]; check "SKILL.md 500줄 이하" $? 0
head -1 "$D/SKILL.md" | grep -q '^---$'; check "프론트매터" $? 0
grep -q '^name: telegram-report$' "$D/SKILL.md"; check "name" $? 0
grep -q '^description: .*쓴다' "$D/SKILL.md"; check "description 에 언제 쓰는지" $? 0
grep -q 'CLAUDE_SKILL_DIR' "$D/SKILL.md"; check "경로는 CLAUDE_SKILL_DIR" $? 0
echo "통과 $pass, 실패 $fail"; [ "$fail" -eq 0 ]
