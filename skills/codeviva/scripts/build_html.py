#!/usr/bin/env python3
"""Validate a questions JSON file and build the HTML question bank.

Usage: build_html.py questions.json output.html
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

TEMPLATE = Path(__file__).resolve().parent.parent / "references" / "question-template.html"
PLACEHOLDER = "__QUESTIONS_JSON__"
DIFFICULTIES = {"easy", "medium", "hard"}
LINES_RE = re.compile(r"^(.*?):(\d+(?:-\d+)?)$")


def norm_file(f):
    """Accept "path:10-20" strings or {file, lines, symbol, note} objects."""
    if isinstance(f, str):
        m = LINES_RE.match(f)
        return {"file": m.group(1), "lines": m.group(2)} if m else {"file": f}
    if isinstance(f, dict) and f.get("file"):
        return {k: str(f[k]).strip() for k in ("file", "lines", "symbol", "note") if f.get(k)}
    fail(f"bad files entry: {f!r}")


def fail(msg):
    sys.exit(f"error: {msg}")


def clean(data, fallback_title):
    if not isinstance(data, dict) or not isinstance(data.get("questions"), list):
        fail('expected an object with a "questions" list')
    seen, questions = set(), []
    for i, q in enumerate(data["questions"], 1):
        qid = str(q.get("id") or f"q{i}")
        if qid in seen:
            fail(f"duplicate id: {qid}")
        seen.add(qid)
        text = str(q.get("question", "")).strip()
        if not text:
            fail(f"{qid}: empty question")
        diff = str(q.get("difficulty", "medium")).lower()
        if diff not in DIFFICULTIES:
            fail(f"{qid}: difficulty must be easy, medium or hard (got {diff!r})")
        files = [norm_file(f) for f in q.get("files", [])]
        if q.get("answer"):
            gaps = [f["file"] for f in files if not (f.get("lines") and f.get("symbol"))]
            if gaps:
                fail(f"{qid}: answers need lines and symbol (method/function/class) for every file entry; missing on {gaps}")
        if len(text.split()) < 8:
            print(f"warning: {qid}: question is very short, add context", file=sys.stderr)
        if q.get("answer") and len(str(q["answer"]).split()) < 25:
            print(f"warning: {qid}: answer is thin, explain the why", file=sys.stderr)
        item = {
            "id": qid,
            "category": str(q.get("category") or "General").strip(),
            "difficulty": diff,
            "question": text,
            "files": files,
        }
        if q.get("answer"):
            item["answer"] = str(q["answer"]).strip()
        if q.get("weak"):
            item["weak"] = True
        questions.append(item)
    if not questions:
        fail("no questions found")
    return {"title": data.get("title") or fallback_title, "questions": questions}


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    try:
        raw = json.loads(src.read_text())
    except (OSError, json.JSONDecodeError) as e:
        fail(f"cannot read {src}: {e}")
    data = clean(raw, src.resolve().parent.parent.name or "Project")

    # "</" would end the script tag early if it appeared inside the JSON.
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = TEMPLATE.read_text().replace(PLACEHOLDER, payload)
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(html)

    qs = data["questions"]
    print(f"wrote {dst} ({len(qs)} questions, {sum('answer' in q for q in qs)} with answers)")
    print("categories:", dict(Counter(q["category"] for q in qs)))
    print("difficulty:", dict(Counter(q["difficulty"] for q in qs)))


if __name__ == "__main__":
    main()