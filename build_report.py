#!/usr/bin/env python3
"""아침 리포트 글을 만든다(토큰 0). 제목 한 줄 + '- ' 줄 형식으로만 출력한다.

숫자는 STATS_FILE(기본: fixtures/report-stats.json)에서 읽는다.
이 저장소의 숫자는 가상의 예시다. 실제 방문 기록을 연결할 때는 이 파일을 만드는 쪽을 바꾼다.
"""
import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
path = os.environ.get("STATS_FILE", os.path.join(here, "fixtures", "report-stats.json"))

try:
    with open(path, encoding="utf-8") as f:
        s = json.load(f)
    visitors = int(s["visitors"])
    clicks = int(s["clicks"])
    top_menu = str(s["top_menu"]).strip()
    todos = [str(t).strip() for t in s.get("todos", []) if str(t).strip()]
except (OSError, ValueError, KeyError) as e:
    print(f"build_report.py: 숫자 파일을 읽지 못했습니다 ({e})", file=sys.stderr)
    sys.exit(1)

lines = [
    "어제의 today-menu",
    f"- 방문자 {visitors}명",
    f"- 메뉴 뽑기 버튼 누른 횟수 {clicks}번",
    f"- 가장 많이 나온 메뉴는 {top_menu}",
]
if todos:
    lines.append("")
    lines.append("오늘 할 일")
    lines += [f"- {t}" for t in todos]

print("\n".join(lines))
