"""Pack each course into ONE html file that works on any device.

    hello-html-course.html        hello-python-course.html
    hello-typescript-course.html  hello-cpp-course.html

Everything goes inside the file: every lesson, the cheat sheet, the styles,
the interactive engine, the pictures, and (for Python and TypeScript) the
language itself. Copy the file to an iPad, a phone or a USB stick and open it.

Run it again after changing any lesson:
    python3 tools/build-single-file.py            # all courses
    python3 tools/build-single-file.py python     # just one
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

COURSES = {
    "html": {
        "dir": ".", "out": "hello-html-course.html", "title": "Hello HTML",
        "config": None, "scripts": [], "images": "lessons/images",
    },
    "python": {
        "dir": "python", "out": "hello-python-course.html", "title": "Hello Python",
        "config": "python/course-config.js",
        "scripts": ["assets/vendor/skulpt.min.js", "assets/vendor/skulpt-stdlib.js", "assets/code.js"],
        "images": None,
    },
    "typescript": {
        "dir": "typescript", "out": "hello-typescript-course.html", "title": "Hello TypeScript",
        "config": "typescript/course-config.js",
        "scripts": ["assets/vendor/typescript.min.js", "assets/vendor/typescript-libs.js", "assets/code.js"],
        "images": None,
    },
    "cpp": {
        "dir": "cpp", "out": "hello-cpp-course.html", "title": "Hello C++",
        "config": "cpp/course-config.js", "scripts": ["assets/code.js"], "images": None,
    },
}


def inside(pattern, text, what):
    match = re.search(pattern, text, re.S)
    if not match:
        raise SystemExit(f"Could not find {what}")
    return match.group(1)


def script_text(path):
    code = (ROOT / path).read_text()
    # A closing tag inside the inlined code would end the script early.
    if "</script" in code.lower():
        raise SystemExit(f"{path} contains </script and can't be inlined")
    return code


def build(name):
    c = COURSES[name]
    course_dir = ROOT / c["dir"]
    if not (course_dir / "lessons").exists():
        print(f"skip {name}: no lessons yet")
        return
    css = (ROOT / "assets/course.css").read_text()
    if "</style" in css.lower():
        raise SystemExit("course.css contains </style and can't be inlined")

    list_source = (ROOT / c["config"]).read_text() if c["config"] else (ROOT / "assets/course.js").read_text()
    pages = re.findall(r"\{ id: '(\d\d-[\w-]+)'", list_source) + ["cheatsheet"]

    # Home page: the body without its <script src> lines, with links pointing at #lesson-name.
    home = inside(r"<body[^>]*>(.*)</body>", (course_dir / "index.html").read_text(), f"the {name} home page body")
    home = re.sub(r'\s*<script src="[^"]*"></script>', "", home)
    home = re.sub(r'href="lessons/([\w-]+)\.html"', r'href="#\1"', home)

    # Lessons: just the inside of <main class="lesson">.
    lessons = []
    for page_id in pages:
        html = (course_dir / "lessons" / f"{page_id}.html").read_text()
        main = inside(r'<main class="lesson">(.*)</main>', html, f"<main> in {name}/{page_id}")
        lessons.append(f'<div data-page="{page_id}" hidden>\n{main}\n</div>')

    # Pictures, stored inside the file as text (base64).
    assets = []
    if c["images"]:
        for svg in sorted((ROOT / c["images"]).glob("*.svg")):
            data = base64.b64encode(svg.read_bytes()).decode()
            assets.append(f'"images/{svg.name}": "data:image/svg+xml;base64,{data}"')

    scripts = []
    if c["config"]:
        scripts.append(script_text(c["config"]))
    scripts += [script_text(s) for s in c["scripts"]]
    scripts.append("window.COURSE_ASSETS = {\n" + ",\n".join(assets) + "\n};")
    scripts.append(script_text("assets/course.js"))
    script_tags = "\n".join(f"<script>\n{s}\n</script>" for s in scripts)

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="{c['title']}">
<title>{c['title']}</title>
<!-- Built by tools/build-single-file.py. Edit the lesson files, then rebuild. -->
<style>
{css}
</style>
</head>
<body data-root="." data-single>
<noscript><div class="noscript"><strong>This course needs JavaScript to run.</strong> You may be seeing a quick preview. Open this file in a web browser app to use the live code boxes.</div></noscript>

<div data-page="home">
{home}
</div>

<div class="layout" id="lesson-shell" hidden>
  <nav class="sidebar" id="sidebar" aria-label="All lessons"></nav>
  <main class="lesson">
{chr(10).join(lessons)}
  </main>
</div>

{script_tags}
</body>
</html>
"""
    out = ROOT / c["out"]
    out.write_text(page)
    print(f"Wrote {c['out']}: {len(pages)} pages, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    for course in (sys.argv[1:] or list(COURSES)):
        build(course)
