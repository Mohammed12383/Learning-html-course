/* Python, C++ and TypeScript colors for the videos: borrowed from the course's own assets/code.js. */
(function () {
  const L = {};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const api = {
    el: (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; },
    esc, dedent: s => s, registerLang: (n, f) => { L[n] = f; }, registerComponent: () => {},
    highlight: (c, l) => window.hlCode(c, l), nextId: () => 0
  };
  (window.HelloCourseExtensions || []).forEach(f => f(api));
  const base = window.hlCode;
  window.hlCode = (code, lang) => (L[lang] ? L[lang](code) : base(code, lang));
})();
