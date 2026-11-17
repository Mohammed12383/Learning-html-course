# Hello Courses

Four visual programming courses for total beginners: **HTML & CSS**, **Python**, **TypeScript** and **C++**. Every lesson shows a short explanation, the code, and the result side by side. Change the code and see what happens.

| Course | Lessons | Final project | Runs |
| --- | --- | --- | --- |
| **Hello HTML** | 17 + cheat sheet | Daybloom, a two-page website | in the page, offline |
| **Hello Python** | 17 + cheat sheet | Pocket Pet, a virtual pet game | in the page, offline (Skulpt) |
| **Hello TypeScript** | 17 + cheat sheet | Daybloom Tasks, a working to-do app | in the page, offline (the real TypeScript compiler) |
| **Hello C++** | 17 + cheat sheet | Robot Arena, a battle game | online compiler (Compiler Explorer); saved results offline |

## How to open the courses

- **One file per course, any device (iPad, phone, computer):**
  `hello-html-course.html`, `hello-python-course.html`, `hello-typescript-course.html`, `hello-cpp-course.html`.
  Each file holds the whole course. Open it in a web browser.
- **As a website:** turn on GitHub Pages for this repository (Settings → Pages → Deploy from a branch → pick the branch → `/ (root)` → Save). Then open `https://<your-username>.github.io/Learning-html-course/` (the HTML course links to the others), or a single-file course such as `.../hello-python-course.html`. On an iPad, tap Share → **Add to Home Screen** to get an app icon.
- **On a computer:** download the repository and double-click `index.html`, `python/index.html`, `typescript/index.html` or `cpp/index.html`.

## Inside each lesson

- **Code boxes**: edit and run. Python and TypeScript run again by themselves when you stop typing. Errors are marked on their line with a plain-language explanation.
- **Explorers**: sliders and menus that change the code and run it again.
- **Step-through viewers**: watch a program run one line at a time, with the computer's memory drawn as boxes.
- **X-ray** (HTML): outlines every element and shows its size in pixels.
- **Your turn** tasks, **Common mistakes**, a **Quick check** quiz and a **Remember** summary. **Mark as done** fills your progress bar (saved in your browser).

## Folders

```
index.html            the HTML course home page
lessons/              HTML lessons and cheat sheet
python/               the Python course (index.html, lessons/, course-config.js)
typescript/           the TypeScript course
cpp/                  the C++ course
practice/             a blank HTML page to practice in
my-site/              the finished HTML final project
assets/course.css     the courses' design
assets/course.js      the course engine: menus, progress, playgrounds, quizzes
assets/code.js        code boxes for Python, TypeScript and C++
assets/vendor/        Skulpt (Python in the browser) and the TypeScript compiler, with their licenses
tools/                build-single-file.py (makes the one-file courses), update-cpp-outputs.py
```

## After changing a lesson

```
python3 tools/update-cpp-outputs.py     # C++ only: recompile examples and save their outputs (needs g++)
python3 tools/build-single-file.py      # rebuild the one-file courses
```
