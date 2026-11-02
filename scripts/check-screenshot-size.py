#!/usr/bin/env python3
"""스토어 스크린샷 크기·형식·알파 채널 점검 (39장). 표준 라이브러리만 쓴다. 파일은 읽기만 한다.

사용: python3 scripts/check-screenshot-size.py <파일|폴더>... [--store apple|google]
종료 코드: 문제가 있으면 1, 없으면 0
"""
import struct
import sys
from pathlib import Path

APPLE = {(1260, 2736), (1290, 2796), (1320, 2868), (1284, 2778), (1242, 2688), (2064, 2752), (2048, 2732)}


def png_info(data):
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    w, h = struct.unpack(">II", data[16:24])
    color_type = data[25]
    alpha = color_type in (4, 6) or b"tRNS" in data[:4096] or b"tRNS" in data
    return "png", w, h, alpha


def jpeg_info(data):
    if data[:2] != b"\xff\xd8":
        return None
    i = 2
    while i + 9 < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack(">HH", data[i + 5:i + 9])
            return "jpeg", w, h, False
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        length = struct.unpack(">H", data[i + 2:i + 4])[0]
        i += 2 + length
    return None


def check(path, store):
    problems = []
    data = path.read_bytes()
    info = png_info(data) or jpeg_info(data)
    if info is None:
        return ["PNG/JPEG 형식이 아님"]
    _, w, h, alpha = info
    if alpha:
        problems.append("알파 채널(투명)이 있음")
    if store in ("apple", "both"):
        if (w, h) not in APPLE:
            problems.append(f"애플이 받는 크기가 아님 ({w}x{h})")
    if store in ("google", "both"):
        if not (320 <= min(w, h) and max(w, h) <= 3840):
            problems.append(f"구글 한 변 범위(320~3840) 밖 ({w}x{h})")
        if max(w, h) > 2 * min(w, h):
            problems.append(f"구글 비율 초과(긴 변이 짧은 변의 2배 초과) ({w}x{h})")
    print(f"{path}: {info[0]} {w}x{h} alpha={'yes' if alpha else 'no'}")
    return problems


def main(argv):
    store = "both"
    args = []
    it = iter(argv)
    for a in it:
        if a == "--store":
            store = next(it, "both")
        else:
            args.append(a)
    if store not in ("apple", "google", "both"):
        print("--store 는 apple 또는 google")
        return 2
    files = []
    for a in args:
        p = Path(a)
        if p.is_dir():
            files += sorted(x for x in p.iterdir() if x.suffix.lower() in (".png", ".jpg", ".jpeg"))
        elif p.is_file():
            files.append(p)
        else:
            print(f"없음: {a}")
            return 2
    if not files:
        print("점검할 파일이 없음")
        return 2
    bad = 0
    for f in files:
        for msg in check(f, store):
            print(f"  문제: {msg}")
            bad += 1
    print(f"파일 {len(files)}개, 문제 {bad}건")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
