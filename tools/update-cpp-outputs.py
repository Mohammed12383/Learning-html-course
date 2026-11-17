"""Compile and run every C++ example in the C++ course, and save its output in the page.

The C++ code boxes compile online when you press Run. The saved output is what
they show before that, and when there is no internet. This script keeps the
saved outputs correct. It needs g++ (the GNU C++ compiler) on this computer.

    python3 tools/update-cpp-outputs.py

Examples that fail to compile (mistakes on purpose) get no saved output.
"""
import html
import pathlib
import re
import subprocess
import tempfile
import textwrap

ROOT = pathlib.Path(__file__).resolve().parent.parent
RUNNABLE = re.compile(r'(<div class="runnable" data-lang="cpp"[^>]*>)(.*?)(\n[ \t]*</div>)', re.S)
CODE = re.compile(r'(<script type="text/plain"(?![^>]*data-expected)[^>]*>)(.*?)(</script>)', re.S)
EXPECTED = re.compile(r'\n[ \t]*<script type="text/plain" data-expected>.*?</script>', re.S)


def run(code, stdin):
    with tempfile.TemporaryDirectory() as tmp:
        src = pathlib.Path(tmp) / "main.cpp"
        exe = pathlib.Path(tmp) / "main"
        src.write_text(code)
        built = subprocess.run(["g++", "-std=c++20", "-O1", str(src), "-o", str(exe)], capture_output=True, text=True)
        if built.returncode != 0:
            return None, built.stderr
        try:
            ran = subprocess.run([str(exe)], input=stdin, capture_output=True, text=True, timeout=5)
            return ran.stdout, ran.stderr
        except subprocess.TimeoutExpired as e:
            return (e.stdout or b"").decode() if isinstance(e.stdout, bytes) else (e.stdout or ""), "timed out"


def update(path):
    text = path.read_text()
    report = []

    def fix(m):
        opening, body, closing = m.groups()
        body = EXPECTED.sub("", body)
        code_match = CODE.search(body)
        if not code_match:
            return opening + body + closing
        code = textwrap.dedent(code_match.group(2)).strip("\n") + "\n"
        stdin_attr = re.search(r'data-input="([^"]*)"', opening)
        stdin = html.unescape(stdin_attr.group(1)).replace("\\n", "\n") + "\n" if stdin_attr else ""
        title = (re.search(r'data-title="([^"]*)"', opening) or [None, "?"])[1]
        out, err = run(code, stdin)
        if out is None:
            report.append(f"  did not compile (no saved output): {title}")
            return opening + body + closing
        if err == "timed out":
            report.append(f"  never finishes (no saved output): {title}")
            return opening + body + closing
        if "</script" in out.lower():
            raise SystemExit(f"output of {title} contains </script")
        indent = re.match(r"\n([ \t]*)", closing).group(1) + "  "
        report.append(f"  ok: {title}" + (f"  [stderr: {err.strip()[:60]}]" if err.strip() else ""))
        saved = f'\n{indent}<script type="text/plain" data-expected>\n{out}</script>'
        return opening + body + saved + closing

    new = RUNNABLE.sub(fix, text)
    if new != text:
        path.write_text(new)
    return report


if __name__ == "__main__":
    pages = [ROOT / "cpp" / "index.html"] + sorted((ROOT / "cpp" / "lessons").glob("*.html"))
    for page in pages:
        if page.exists():
            lines = update(page)
            if lines:
                print(page.relative_to(ROOT))
                print("\n".join(lines))
