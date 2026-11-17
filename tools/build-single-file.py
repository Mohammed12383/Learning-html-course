"""Pack the whole course into ONE html file: hello-html-course.html

Everything goes inside that file: every lesson, the cheat sheet, the
styles, the interactive engine and the pictures. Copy it to any device
(an iPad, a phone, a USB stick) and open it. No other files needed.

Run it again after changing any lesson:
    python3 tools/build-single-file.py
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "hello-html-course.html"

# The lessons, in order (same order as the menu in assets/course.js).
LESSON_IDS = re.findall(r"\{ id: '([\w-]+)'", (ROOT / "assets/course.js").read_text())
PAGES = LESSON_IDS + ["cheatsheet"]


def inside(tag_pattern, text, what):
    match = re.search(tag_pattern, text, re.S)
    if not match:
        raise SystemExit(f"Could not find {what}")
    return match.group(1)


css = (ROOT / "assets/course.css").read_text()
js = (ROOT / "assets/course.js").read_text()
# A closing tag inside the inlined code would end it early.
if "</style" in css.lower():
    raise SystemExit("course.css contains </style and can't be inlined")
if "</script" in js.lower():
    raise SystemExit("course.js contains </script and can't be inlined")

# Home page: the body without its <script src> line, with links pointing at #lesson-name.
home = inside(r"<body[^>]*>(.*)</body>", (ROOT / "index.html").read_text(), "the home page body")
home = re.sub(r'\s*<script src="[^"]*"></script>\s*', "\n", home)
home = re.sub(r'href="lessons/([\w-]+)\.html"', r'href="#\1"', home)

# Lessons: just the inside of <main class="lesson">.
lessons = []
for page_id in PAGES:
    html = (ROOT / "lessons" / f"{page_id}.html").read_text()
    main = inside(r'<main class="lesson">(.*)</main>', html, f"<main> in {page_id}")
    lessons.append(f'<div data-page="{page_id}" hidden>\n{main}\n</div>')

# Pictures, stored inside the file as text (base64).
assets = []
for svg in sorted((ROOT / "lessons/images").glob("*.svg")):
    data = base64.b64encode(svg.read_bytes()).decode()
    assets.append(f'"images/{svg.name}": "data:image/svg+xml;base64,{data}"')

page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Hello HTML">
<title>Hello HTML</title>
<!-- Built by tools/build-single-file.py. Edit the files in lessons/ and assets/, then rebuild. -->
<style>
{css}
</style>
</head>
<body data-root="." data-single>
<noscript><div class="noscript"><strong>This course needs JavaScript to run.</strong> You may be seeing a quick preview. Open this file in a web browser app to use the live code editors.</div></noscript>

<div data-page="home">
{home}
</div>

<div class="layout" id="lesson-shell" hidden>
  <nav class="sidebar" id="sidebar" aria-label="All lessons"></nav>
  <main class="lesson">
{chr(10).join(lessons)}
  </main>
</div>

<script>
window.COURSE_ASSETS = {{
{("," + chr(10)).join(assets)}
}};
</script>
<script>
{js}
</script>
</body>
</html>
"""

OUT.write_text(page)
print(f"Wrote {OUT.name}: {len(PAGES)} pages, {len(assets)} pictures, {OUT.stat().st_size // 1024} KB")
