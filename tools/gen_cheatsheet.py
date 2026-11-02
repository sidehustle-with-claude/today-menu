#!/usr/bin/env python3
"""부록 E 치트시트를 cheatsheet/ 폴더의 세 파일로 나눈다. 내용은 요약하지 않고 그대로 옮긴다.

사용법:
    python3 tools/gen_cheatsheet.py <원고폴더> <출력폴더>

만드는 파일
- README.md    목차 겸 안내 (맨 앞 설명, 읽는 법, 사람이 직접 하는 것, 확인한 날짜)
- commands.md  슬래시 명령, 단축키, 터미널 명령
- prompts.md   상황별 클로드에게 시킬 말

같은 입력이면 늘 같은 결과(멱등)다.
"""
import os
import sys


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read().replace("\r\n", "\n")


def write(p, text):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if os.path.exists(p) and read(p) == text:
        return
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def split_h2(lines):
    """('머리', [줄]) 와 {'## 제목': [줄]} 순서 목록으로 나눈다."""
    head, secs, cur = [], [], None
    for ln in lines:
        if ln.startswith("## "):
            cur = [ln.strip(), []]
            secs.append(cur)
        elif cur is None:
            head.append(ln)
        else:
            cur[1].append(ln)
    return head, secs


def body(title_line, lines):
    return "\n".join([title_line] + lines).rstrip("\n") + "\n"


def main():
    if len(sys.argv) != 3:
        sys.exit("사용법: python3 tools/gen_cheatsheet.py <원고폴더> <출력폴더>")
    src, out = sys.argv[1], sys.argv[2]
    names = [n for n in os.listdir(src) if n.startswith("부록E")]
    if not names:
        sys.exit("부록E 파일이 없습니다: %s" % src)
    head, secs = split_h2(read(os.path.join(src, names[0])).split("\n"))
    by = {t: l for t, l in secs}
    for need in ("## 슬래시 명령", "## 단축키", "## 터미널 명령",
                 "## 상황별 클로드에게 시킬 말", "## 사람이 직접 하는 것", "## 확인한 날짜"):
        if need not in by:
            sys.exit("부록 E에 '%s' 절이 없습니다" % need)
    toc = [
        "",
        "## 이 폴더의 파일",
        "",
        "- [commands.md](commands.md): 슬래시 명령, 단축키, 터미널 명령",
        "- [prompts.md](prompts.md): 상황별로 클로드에게 시킬 말 모음",
        "",
    ]
    readme = "\n".join(head).rstrip("\n") + "\n" + "\n".join(toc) + "\n"
    for t in ("## 사람이 직접 하는 것", "## 확인한 날짜"):
        readme += body(t, by[t]) + "\n"
    write(os.path.join(out, "README.md"), readme.rstrip("\n") + "\n")
    cmd = "# 부록 E 치트시트: 명령\n\n"
    cmd += "\n".join(body(t, by[t]) for t in ("## 슬래시 명령", "## 단축키", "## 터미널 명령"))
    write(os.path.join(out, "commands.md"), cmd)
    pr = "# 부록 E 치트시트: 클로드에게 시킬 말\n\n" + body("## 상황별 클로드에게 시킬 말", by["## 상황별 클로드에게 시킬 말"])
    write(os.path.join(out, "prompts.md"), pr)


if __name__ == "__main__":
    main()
