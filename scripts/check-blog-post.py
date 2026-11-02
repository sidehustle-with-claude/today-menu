#!/usr/bin/env python3
"""블로그 글 공개 전 점검 (29장).

사용법: python3 scripts/check-blog-post.py [글 파일 또는 폴더 ...]   (기본: blog-example/_posts)

- 찾은 값은 출력하지 않고 파일:줄 번호와 종류만 보여 준다. 결과 자체가 유출되지 않게 하기 위해서다.
- 오류(ERROR)가 있으면 종료 코드 1, 경고(WARN)만 있으면 0.
- 이 점검은 빠뜨릴 수 있다. 마지막 확인은 사람이 글 전체를 읽으며 한다.
"""
import re
import sys
from pathlib import Path

SECRET_PATTERNS = [
    ("API 키(sk-로 시작)", re.compile(r"\bsk-[A-Za-z0-9_-]{16,}")),
    ("GitHub 토큰(ghp_/github_pat_)", re.compile(r"\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})")),
    ("AWS 액세스 키(AKIA/ASIA)", re.compile(r"\b(AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("Slack 토큰(xox)", re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}")),
    ("비밀번호/키 대입", re.compile(r"(?i)\b(password|passwd|secret|api[_-]?key|token)\b\s*[:=]\s*[\"']?[^\s\"'<>]{8,}")),
]
PERSONAL_PATTERNS = [
    ("이메일 주소(example.com 제외)", re.compile(r"[A-Za-z0-9._%+-]+@(?!example\.(com|org|net)\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}")),
    ("전화번호", re.compile(r"\b01[016789][- ]?\d{3,4}[- ]?\d{4}\b")),
    ("내 컴퓨터 경로(/Users/, /home/)", re.compile(r"(/Users/[A-Za-z0-9._-]+|/home/[A-Za-z0-9._-]+)")),
]
FILENAME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*\.(md|markdown)$")
IMAGE_RE = re.compile(r"!\[(?P<alt>[^\]]*)\]\((?P<src>[^)]*)\)")
IMAGE_NAME_BAD = re.compile(r"(?i)(^|/)(img[_-]?\d+|screenshot|스크린샷|image\d*|untitled)[^/]*\.(png|jpe?g|gif|webp)$")

errors = 0
warns = 0


def report(level, path, line, msg):
    global errors, warns
    if level == "ERROR":
        errors += 1
    else:
        warns += 1
    where = f"{path}:{line}" if line else str(path)
    print(f"{level} {where}  {msg}")


def check_file(path: Path):
    if not FILENAME_RE.match(path.name):
        report("ERROR", path, 0, "파일 이름은 YYYY-MM-DD-영문소문자-하이픈.md 형식이어야 합니다 (한글·공백·대문자 금지)")

    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")

    # 머리말(front matter)
    body_start = 0
    if lines and lines[0].strip() == "---":
        try:
            end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
        except StopIteration:
            report("ERROR", path, 1, "머리말을 닫는 --- 줄이 없습니다")
            end = 0
        header = "\n".join(lines[1:end])
        body_start = end + 1
        if not re.search(r"(?m)^title:\s*\S", header):
            report("ERROR", path, 1, "머리말에 title이 없습니다")
        if not re.search(r"(?m)^date:\s*\d{4}-\d{2}-\d{2}", header):
            report("ERROR", path, 1, "머리말에 date(YYYY-MM-DD)가 없습니다")
    else:
        report("ERROR", path, 1, "맨 위에 --- 로 시작하는 머리말이 없습니다")

    for n, line in enumerate(lines, start=1):
        for name, rx in SECRET_PATTERNS:
            if rx.search(line):
                report("ERROR", path, n, f"비밀 값으로 보이는 문자열: {name}")
        for name, rx in PERSONAL_PATTERNS:
            if rx.search(line):
                report("ERROR", path, n, f"개인정보로 보이는 문자열: {name}")

    # 글 구조
    in_code = False
    h1 = 0
    h2 = 0
    for n, line in enumerate(lines[body_start:], start=body_start + 1):
        if line.strip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if re.match(r"^# \S", line):
            h1 += 1
            report("WARN", path, n, "본문에 # 제목이 있습니다. 제목은 머리말 title이 맡으므로 중복입니다")
        if re.match(r"^## \S", line):
            h2 += 1
        for m in IMAGE_RE.finditer(line):
            if not m.group("alt").strip():
                report("WARN", path, n, "이미지 대체 텍스트(alt)가 비어 있습니다")
            if IMAGE_NAME_BAD.search(m.group("src")):
                report("WARN", path, n, "이미지 파일 이름이 내용을 알려 주지 않습니다 (예: IMG_0001.png)")
        if re.search(r"\[(여기|링크|click here|here)\]\(", line, re.I):
            report("WARN", path, n, "링크 글자가 '여기' 같은 말입니다. 어디로 가는지 알려 주세요")
    if h2 == 0:
        report("WARN", path, 0, "소제목(## )이 하나도 없습니다")
    if len(text.strip().split("\n")) < 5:
        report("WARN", path, 0, "글이 너무 짧습니다")


def collect(args):
    if not args:
        args = ["blog-example/_posts"]
    files = []
    for a in args:
        p = Path(a)
        if p.is_dir():
            files += sorted(p.rglob("*.md")) + sorted(p.rglob("*.markdown"))
        elif p.is_file():
            files.append(p)
        else:
            print(f"ERROR {a}  경로가 없습니다")
            sys.exit(2)
    return files


def main():
    files = collect(sys.argv[1:])
    if not files:
        print("점검할 글이 없습니다.")
        return 0
    for f in files:
        check_file(f)
    print(f"\n글 {len(files)}편, 오류 {errors}건, 경고 {warns}건")
    if errors:
        print("오류를 모두 고치기 전에는 올리지 마세요. 키가 이미 올라갔다면 글을 지워도 안전하지 않으니 키 자체를 폐기하세요.")
        return 1
    print("자동 점검은 통과했습니다. 마지막으로 사람이 글 전체를 읽어 보세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
