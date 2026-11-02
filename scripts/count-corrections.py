#!/usr/bin/env python3
"""my-messages.tsv 에서 '고쳐 말한' 신호를 센다 (57장 실습 2, 4). 숫자만 보여 주고 문장 원문은 보여 주지 않는다.

신호: '아니'로 시작, '그게 아니'로 시작, '다시'로 시작, '왜'로 시작
추가로 가장 자주 나온 첫 단어 10개를 센다.

일주일 전후 비교(실습 4)에는 기간을 나눠 두 번 돌린다.
  count-corrections.py --until 2026-11-02      규칙을 넣기 전
  count-corrections.py --since 2026-11-03      규칙을 넣은 뒤
"""
import argparse
import collections
import re
import sys

SIGNALS = [
    ("아니", "아니"),
    ("그게 아니", "그게 아니"),
    ("다시", "다시"),
    ("왜", "왜"),
]


def main():
    ap = argparse.ArgumentParser(description="교정 말 신호를 센다")
    ap.add_argument("tsv", nargs="?", default="my-messages.tsv")
    ap.add_argument("--since", default="", help="이 날짜(YYYY-MM-DD) 이후만")
    ap.add_argument("--until", default="", help="이 날짜(YYYY-MM-DD) 이전만 (그 날 포함)")
    args = ap.parse_args()
    for v in (args.since, args.until):
        if v and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            print("날짜는 YYYY-MM-DD 모양이어야 합니다", file=sys.stderr)
            return 2

    counts = collections.Counter()
    first_words = collections.Counter()
    total = 0
    try:
        f = open(args.tsv, encoding="utf-8", errors="replace")
    except OSError as e:
        print(f"{args.tsv} 를 읽지 못했습니다 ({e}). extract-my-messages.py 를 먼저 돌리세요", file=sys.stderr)
        return 1
    with f:
        for line in f:
            parts = line.rstrip("\n").split("\t", 3)
            if len(parts) < 4:
                continue
            when, _project, _length, text = parts
            day = when[:10]
            if args.since and (not day or day < args.since):
                continue
            if args.until and (not day or day > args.until):
                continue
            text = text.strip()
            if not text:
                continue
            total += 1
            words = re.split(r"[\s,.!?~]+", text, maxsplit=1)
            if words and words[0]:
                first_words[words[0]] += 1
            for label, prefix in SIGNALS:
                if text.startswith(prefix):
                    counts[label] += 1

    period = f"{args.since or '처음'} ~ {args.until or '지금'}"
    print(f"기간: {period}")
    print(f"내 말 전체: {total}줄")
    for label, _ in SIGNALS:
        print(f"- '{label}'로 시작: {counts[label]}줄")
    print("가장 자주 나온 첫 단어 10개")
    for word, n in first_words.most_common(10):
        print(f"- {word}: {n}번")
    return 0


if __name__ == "__main__":
    sys.exit(main())
