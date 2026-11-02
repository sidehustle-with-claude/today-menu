#!/usr/bin/env python3
"""원고에서 장별 체크리스트 파일을 만든다.

사용법:
    python3 tools/gen_checklists.py <원고폴더> <출력폴더>

<원고폴더>에는 NN-*.md(각 장), 부록A-*.md, 부록B/C/D-*.md 가 있어야 한다.
<출력폴더>에는 chapters/NN-slug.md 와 appendix/{B,C,D}-*.md 가 만들어진다.
README.md 와 CHANGELOG.md 는 건드리지 않는다. 같은 입력이면 늘 같은 결과(멱등).

규칙
- 체크리스트 항목은 각 장 파일의 "이 장 체크리스트"가 기준이다.
- 요금제는 장 파일, 선행 장·사람 몫·요약 3줄은 부록 A에서 가져온다.
  부록 A에 없으면 장 파일의 "시작하기 전에"·"이 장에서 얻는 것"으로 채운다.
- 장 파일과 부록 A의 항목이 다르면 표준 오류로 알리고, 장 파일 쪽을 쓴다.
"""
import os
import re
import sys

SLUGS = {
    0: "intro", 1: "artifact", 2: "claude-code-first-page", 3: "git-github-commit",
    4: "claude-md-rules", 5: "tone-and-format", 6: "skills", 7: "mcp", 8: "hooks",
    9: "choose-model", 10: "save-tokens", 11: "tech-map", 12: "data-storage",
    13: "game-engine", 14: "design", 15: "llm-roles", 16: "llm-free-parts",
    17: "ai-in-service", 18: "tool-use-api", 19: "credits-free-api",
    20: "multilingual", 21: "e2e-testing", 22: "maestro-appium", 23: "testflight",
    24: "play-store-testing", 25: "vercel-deploy", 26: "cloudflare-workers-d1",
    27: "supabase", 28: "aws-when", 29: "github-blog", 30: "domain",
    31: "law-mcp", 32: "seo-geo", 33: "app-landing-page", 34: "ga",
    35: "search-console", 36: "bing-ai-search", 37: "payments", 38: "ads",
    39: "store-review", 40: "telegram", 41: "phone-remote", 42: "email",
    43: "chromectl", 44: "mac-iphone", 45: "codex", 46: "whisper", 47: "ffmpeg",
    48: "suno", 49: "subagents", 50: "multi-session", 51: "harness", 52: "goal",
    53: "loop", 54: "daily-routine", 55: "make-skill", 56: "llm-wiki",
    57: "session-log", 58: "side-business",
}

APPENDIX = {"B": "agent-toc", "C": "oss-map", "D": "glossary"}
ITEM = re.compile(r"^- \[[ xX]\] (.+)$")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read().replace("\r\n", "\n")


def section(lines, heading):
    """'## heading' 아래 다음 '## ' 전까지의 줄."""
    out, on = [], False
    for ln in lines:
        if ln.startswith("## "):
            if on:
                break
            on = ln[3:].strip() == heading
            continue
        if on:
            out.append(ln)
    return out


def parse_chapter(path):
    lines = read(path).split("\n")
    m = re.match(r"^# (\d+)장 (.+)$", lines[0])
    if not m:
        raise SystemExit("제목 줄 형식이 다름: %s" % path)
    num, title = int(m.group(1)), m.group(2).strip()
    plan = next((l.split(":", 1)[1].strip() for l in lines[:6] if l.startswith("요금제:")), "")
    items = [ITEM.match(l).group(1) for l in section(lines, "이 장 체크리스트") if ITEM.match(l)]
    gains = [l for l in section(lines, "이 장에서 얻는 것") if l.startswith("- ")]
    pre = next((l[2:].split(":", 1)[1].strip() for l in section(lines, "시작하기 전에")
                if l.startswith("- 앞 장")), "")
    return dict(num=num, title=title, plan=plan, items=items, gains=gains, pre=pre)


def parse_appendix_a(path):
    lines = read(path).split("\n")
    start = next(i for i, l in enumerate(lines) if l.startswith("# 장별 체크리스트"))
    chapters, cur, mode = {}, None, None
    for ln in lines[start + 1:]:
        m = re.match(r"^## (\d+)장 (.+)$", ln)
        if m:
            cur = dict(title=m.group(2).strip(), plan="", pre="", human="", summary=[], items=[])
            chapters[int(m.group(1))] = cur
            mode = None
            continue
        if cur is None:
            continue
        if ln.startswith("요금제:"):
            cur["plan"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("선행 장:"):
            cur["pre"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("사람 몫:"):
            cur["human"] = ln.split(":", 1)[1].strip()
        elif ln.strip() == "요약":
            mode = "summary"
        elif ln.strip() == "체크리스트":
            mode = "items"
        elif mode == "summary" and ln.startswith("- "):
            cur["summary"].append(ln)
        elif mode == "items" and ITEM.match(ln):
            cur["items"].append(ITEM.match(ln).group(1))
    return chapters


def find_chapter_files(src):
    files = {}
    for name in sorted(os.listdir(src)):
        m = re.match(r"^(\d{2})-.+\.md$", name)
        if m:
            files[int(m.group(1))] = os.path.join(src, name)
    return files


def pre_from_chapter(text):
    nums = re.findall(r"(\d+)장", text)
    return ", ".join(nums) if nums else "없음"


def render(num, ch, a):
    title = ch["title"]
    plan = ch["plan"] or a.get("plan", "")
    pre = a.get("pre") or pre_from_chapter(ch["pre"])
    human = a.get("human") or "(없음)"
    summary = a.get("summary") or ch["gains"][:3]
    out = ["## %d장 %s" % (num, title),
           "요금제: %s" % plan,
           "선행 장: %s" % pre,
           "사람 몫: %s" % human,
           "요약"]
    out += summary
    out.append("체크리스트")
    out += ["- [ ] %s" % t for t in ch["items"]]
    return "\n".join(out) + "\n"


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path) and read(path) == text:
        return
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def main():
    if len(sys.argv) != 3:
        sys.exit("사용법: python3 tools/gen_checklists.py <원고폴더> <출력폴더>")
    src, out = sys.argv[1], sys.argv[2]
    app_a = [n for n in os.listdir(src) if n.startswith("부록A")]
    if not app_a:
        sys.exit("부록A 파일이 없습니다: %s" % src)
    a_all = parse_appendix_a(os.path.join(src, app_a[0]))
    files = find_chapter_files(src)
    total, diffs = 0, []
    for num in sorted(SLUGS):
        if num not in files:
            sys.exit("%d장 파일이 없습니다" % num)
        ch = parse_chapter(files[num])
        if ch["num"] != num:
            sys.exit("%d장 파일의 제목 번호가 다릅니다" % num)
        a = a_all.get(num, {})
        sa, sc = set(a.get("items", [])), set(ch["items"])
        for t in ch["items"]:
            if t not in sa:
                diffs.append("%d장 | 장 파일에만 있음 | %s" % (num, t))
        for t in a.get("items", []):
            if t not in sc:
                diffs.append("%d장 | 부록 A에만 있음 | %s" % (num, t))
        if a and a.get("title") != ch["title"]:
            diffs.append("%d장 | 제목 다름 | 장: %s / 부록 A: %s" % (num, ch["title"], a.get("title")))
        total += len(ch["items"])
        write(os.path.join(out, "chapters", "%02d-%s.md" % (num, SLUGS[num])), render(num, ch, a))
    for letter, slug in APPENDIX.items():
        names = [n for n in os.listdir(src) if n.startswith("부록" + letter)]
        if not names:
            sys.exit("부록%s 파일이 없습니다" % letter)
        write(os.path.join(out, "appendix", "%s-%s.md" % (letter, slug)),
              read(os.path.join(src, names[0])))
    claimed = None
    m = re.search(r"항목 (\d+)개", read(os.path.join(src, app_a[0])))
    if m:
        claimed = int(m.group(1))
    print("장 파일 %d개, 체크리스트 항목 %d개 (부록 A가 말하는 수: %s)" % (len(SLUGS), total, claimed))
    print("부록 A와 다른 항목 %d건" % len(diffs))
    for d in diffs:
        print("  " + d)


if __name__ == "__main__":
    main()
