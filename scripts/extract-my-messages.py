#!/usr/bin/env python3
"""내가 입력한 말만 뽑아 my-messages.tsv 로 저장한다 (57장 실습 1).

- 읽는 곳: --root (기본 ~/.claude/projects) 아래의 */*.jsonl
- 쓰는 곳: --out (기본 my-messages.tsv). 칸은 탭으로 나눈다: 시각, 프로젝트, 글자 수, 문장
- 방어적으로 읽는다: 필드가 없으면 건너뛰고, 깨진 줄이 있어도 멈추지 않는다.
- 도구 실행 결과(toolUseResult, tool_result 블록)와 시스템이 넣은 줄(isMeta)은 제외한다.
- 문장은 200자까지만 남기고, 이메일/전화번호/키처럼 보이는 문자열은 가린다.
- 인터넷에 아무것도 보내지 않는다. 화면에는 개수만 찍고 문장 내용은 찍지 않는다.
- 기록 파일의 형식은 Claude Code 내부용이라 버전마다 바뀔 수 있다. 어느 날부터 0개가 뽑히면 한 줄을 열어 필드 이름을 확인한다.
"""
import argparse
import json
import pathlib
import re
import sys

MASKS = [
    (re.compile(r"[\w.+-]+@[\w-]+(\.[\w-]+)+"), "<이메일>"),
    (re.compile(r"\b0\d{1,2}-\d{3,4}-\d{4}\b"), "<전화>"),
    (re.compile(r"\b\d{6}-[1-4]\d{6}\b"), "<주민번호>"),
    (re.compile(r"\b\d{8,10}:[A-Za-z0-9_-]{30,}\b"), "<봇토큰>"),
    (re.compile(r"\b(?:sk|pk|re|ghp|gho|xox[bpas])[-_][A-Za-z0-9_-]{16,}"), "<키>"),
]


def mask(text):
    for pattern, repl in MASKS:
        text = pattern.sub(repl, text)
    return text


def user_texts(path):
    """한 jsonl 파일에서 (시각, 문장)을 차례로 내준다."""
    try:
        f = open(path, encoding="utf-8", errors="replace")
    except OSError:
        return
    with f:
        for line in f:
            try:
                row = json.loads(line)
            except ValueError:
                continue
            if not isinstance(row, dict):
                continue
            if row.get("type") != "user" or row.get("isMeta") or "toolUseResult" in row:
                continue
            msg = row.get("message")
            content = msg.get("content") if isinstance(msg, dict) else None
            when = str(row.get("timestamp") or "")
            if isinstance(content, str):
                yield when, content
            elif isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text = block.get("text")
                        if isinstance(text, str):
                            yield when, text


def main():
    ap = argparse.ArgumentParser(description="내가 입력한 말만 my-messages.tsv 로 뽑는다")
    ap.add_argument("--root", default=str(pathlib.Path.home() / ".claude" / "projects"))
    ap.add_argument("--out", default="my-messages.tsv")
    ap.add_argument("--since", default="", help="이 날짜(YYYY-MM-DD) 이후의 말만. 예: 2026-10-27")
    args = ap.parse_args()

    if args.since and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.since):
        print("--since 는 YYYY-MM-DD 모양이어야 합니다", file=sys.stderr)
        return 2
    root = pathlib.Path(args.root).expanduser()
    if not root.is_dir():
        print(f"기록 폴더가 없습니다: {root}", file=sys.stderr)
        return 1

    files = sorted(root.glob("*/*.jsonl"))
    rows = 0
    with open(args.out, "w", encoding="utf-8") as out:
        for p in files:
            for when, text in user_texts(p):
                if args.since and (not when or when[:10] < args.since):
                    continue
                text = text.strip()
                if not text:
                    continue
                one = mask(text.replace("\r", " ").replace("\n", " ").replace("\t", " "))[:200]
                out.write(f"{when}\t{p.parent.name}\t{len(text)}\t{one}\n")
                rows += 1
    print(f"파일 {len(files)}개에서 내 말 {rows}줄을 {args.out} 에 저장했습니다")
    return 0 if rows > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
