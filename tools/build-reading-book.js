#!/usr/bin/env node
/*
  Builds hello-courses-book.html: all four courses in ONE page that needs no JavaScript.

  Some viewers turn JavaScript off, for example the quick preview in the iPad Files app.
  There, the normal course files show their text but nothing can run. This book is made
  for those viewers: every lesson is open, one after another, and every example already
  shows its result:
    - websites and drawings as pictures (screenshots taken here),
    - program output as text (the programs are run here, questions get sample answers),
    - step-through viewers written out as stages, one under the other,
    - explorers shown twice: as they start, and with the controls moved,
    - quiz answers written under each question.

  Usage:   node tools/build-reading-book.js
  Needs:   Playwright with Chromium (require('playwright')).
           C++ examples without a saved result are compiled online at godbolt.org,
           so those need internet (set HTTPS_PROXY if you use a proxy).
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.BOOK_OUT || path.join(ROOT, 'hello-courses-book.html');
const WIDTH = 760;          // page width while taking pictures (the book's column is about this wide)
const SCALE = 1.5;          // picture sharpness
const QUALITY = 0.8;        // WebP quality of the pictures

const COURSES = [
  { key: 'html', dir: '', label: 'HTML & CSS', lang: 'html', what: 'Build websites: text, colors, images, buttons, boxes, sizes, layouts and pages.' },
  { key: 'python', dir: 'python', label: 'Python', lang: 'python', what: 'Write programs that talk, decide, repeat, remember and draw.' },
  { key: 'cpp', dir: 'cpp', label: 'C++', lang: 'cpp', what: 'Learn the fast language behind games and apps: types, memory, classes and more.' },
  { key: 'typescript', dir: 'typescript', label: 'TypeScript', lang: 'typescript', what: 'Make web pages come alive, with types that catch mistakes before they happen.' }
];

// Sample answers typed into programs that ask questions (by the example's title)
const ANSWERS = {
  'Press Run, then answer in the output box': ['Sam', 'pizza'],
  'Convert the answer to a number': ['12'],
  'Robo the chatbot': ['sam', '2014', 'Blue'],
  'Silly story maker': ['dragon', 'the beach', 'pancakes', '12'],
  'Your turn: add two numbers': ['8', '5'],
  'Two paths': ['banana123'],
  'Quiz time': ['Paris', '8'],
  'Keep asking until the answer is right': ['54', '56'],
  'Shopping list': ['milk', 'eggs', 'milk', 'bread', 'done'],
  'Never crash on a bad answer': ['lots', '3'],
  'Pocket Pet': ['mochi', 'f', 'fish', 'p', 's', 'f', 'apple', 'q']
};

/* ---------------- reading the course lists ---------------- */
function loadCourse(c) {
  if (c.dir) {
    const win = {};
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, c.dir, 'course-config.js'), 'utf8'), { window: win });
    return { name: win.COURSE.name, logo: win.COURSE.logo, lessons: win.COURSE.lessons, groups: win.COURSE.groups };
  }
  const src = fs.readFileSync(path.join(ROOT, 'assets/course.js'), 'utf8');
  const lessons = src.match(/var LESSONS = CFG\.lessons \|\| (\[[\s\S]*?\n  \]);/)[1];
  const groups = src.match(/var GROUPS = CFG\.groups \|\| (\{[\s\S]*?\n  \});/)[1];
  return { name: 'Hello HTML', logo: '&lt;/&gt;', lessons: vm.runInNewContext('(' + lessons + ')'), groups: vm.runInNewContext('(' + groups + ')') };
}

/* ---------------- helpers that run inside the lesson page ---------------- */
function pageHelpers() {
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const BK = window.BK = {};
  const bench = k => document.querySelector('[data-bk="' + k + '"]');

  BK.list = sel => {
    const root = document.querySelector(sel);
    return [...root.querySelectorAll('.bench')].map((b, k) => {
      b.setAttribute('data-bk', k);
      const type = b.classList.contains('pg-host') ? 'pg'
        : b.classList.contains('run-host') ? 'run'
        : b.classList.contains('step-host') ? 'step'
        : b.classList.contains('ex-host') ? (b.querySelector('.run-view') ? 'cx' : 'hx') : 'other';
      const note = b.querySelector('.console .c-note.quiet');
      return {
        k, type,
        title: (b.querySelector('.bench-title strong') || {}).textContent || '',
        tabs: b.querySelectorAll('.pg-code .pg-tab').length,
        devices: !!b.querySelector('.device-bar'),
        needs: note ? note.textContent : '',
        hasStop: !!b.querySelector('.run-bar')
      };
    });
  };

  // How many examples are still running (or still waiting to start by themselves)
  BK.busy = () => [...document.querySelectorAll('.run-status')].filter(s => {
    const st = s.getAttribute('data-state');
    if (st === 'running') return true;
    if (st === 'idle' && s.textContent === 'Ready') {
      const b = s.closest('.bench');
      return !(b && b.querySelector('.console .c-note'));
    }
    return false;
  }).length;

  BK.state = k => {
    const b = bench(k);
    if (b.querySelector('.c-ask input')) return 'ask';
    const s = b.querySelector('.run-status');
    const st = s.getAttribute('data-state');
    if (st === 'done' || st === 'error') return 'end';
    if (st === 'idle' && s.textContent !== 'Ready' && s.textContent !== 'Press Run' && s.textContent !== 'Saved result') return 'end';
    return 'run';
  };
  BK.text = k => bench(k).querySelector('.console').textContent;
  BK.click = (k, sel) => { const x = bench(k).querySelector(sel); if (x) x.click(); return !!x; };
  BK.stop = k => { const b = bench(k); const btn = [...b.querySelectorAll('.run-bar button')].find(x => x.textContent === 'Stop'); if (btn && !btn.hidden) btn.click(); };

  function editorInfo(ed, name) {
    return {
      name,
      code: ed.querySelector('.ed-hl code').innerHTML.replace(/\s+$/, ''),
      gutter: ed.querySelector('.ed-gutter').innerHTML
    };
  }
  BK.selectTab = (k, i) => {
    const b = bench(k);
    const tab = b.querySelectorAll('.pg-code .pg-tab')[i];
    tab.click();
    return editorInfo(b.querySelector('.pg-code .ed'), tab.textContent);
  };
  BK.frameTitle = (k, i) => {
    try { return bench(k).querySelectorAll('.frame-wrap iframe')[i || 0].contentDocument.title || ''; } catch (e) { return ''; }
  };
  BK.page = k => { const u = bench(k).querySelector('.address .url'); return u ? u.textContent : ''; };
  // Let a website preview grow so the picture shows the whole page (up to a limit)
  BK.grow = (k, i, max) => {
    const wrap = bench(k).querySelectorAll('.frame-wrap')[i || 0];
    if (!wrap) return;
    const f = wrap.querySelector('iframe');
    const m = /scale\(([\d.]+)\)/.exec(f.style.transform || '');
    const s = m ? +m[1] : 1;
    let need = 0;
    try { need = f.contentDocument.documentElement.scrollHeight; } catch (e) { need = 0; }
    if (need > f.offsetHeight + 2) wrap.style.flex = '0 0 ' + Math.round(Math.min(need, max) * s) + 'px';
  };
  BK.ungrow = k => bench(k).querySelectorAll('.frame-wrap').forEach(w => { w.style.flex = ''; });
  // Click the first button inside a program's web page (TypeScript), to show what a click does
  BK.pressButton = k => {
    try {
      const doc = bench(k).querySelector('.frame-wrap iframe').contentDocument;
      const btn = doc.querySelector('button');
      if (!btn) return null;
      const label = btn.textContent.trim().replace(/\s+/g, ' ');
      btn.click();
      return label.slice(0, 40);
    } catch (e) { return null; }
  };
  BK.device = (k, n) => { bench(k).querySelectorAll('.device-bar .mini-btn')[n].click(); };

  function settings(b, changed) {
    return [...b.querySelectorAll('.ex-controls .ctl')].map(ctl => {
      const inp = ctl.querySelector('input, select');
      const name = ctl.querySelector('.ctl-name').textContent;
      const out = ctl.querySelector('output');
      const value = inp && inp.type === 'checkbox' ? (inp.checked ? 'on' : 'off') : (out ? out.textContent : inp.value);
      return { name, value, changed: !!(changed && changed[name]) };
    });
  }
  // Move every control of an explorer to a clearly different value
  BK.vary = k => {
    const b = bench(k);
    const changed = {};
    b.querySelectorAll('.ex-controls .ctl').forEach(ctl => {
      const inp = ctl.querySelector('input, select');
      const name = ctl.querySelector('.ctl-name').textContent;
      if (!inp) return;
      const before = inp.type === 'checkbox' ? inp.checked : inp.value;
      if (inp.type === 'range' || inp.type === 'number') {
        const min = inp.min !== '' ? +inp.min : 0, max = inp.max !== '' ? +inp.max : 100;
        const step = inp.step && inp.step !== 'any' ? +inp.step : 1, v = +inp.value;
        const target = v <= (min + max) / 2 ? min + (max - min) * 0.8 : min + (max - min) * 0.2;
        const val = Math.min(max, Math.max(min, min + Math.round((target - min) / step) * step));
        inp.value = String(+val.toFixed(4));
      } else if (inp.tagName === 'SELECT') {
        const n = inp.options.length;
        inp.selectedIndex = inp.selectedIndex === n - 1 ? 0 : n - 1;
      } else if (inp.type === 'checkbox') {
        inp.checked = !inp.checked;
      } else if (inp.type === 'color') {
        inp.value = inp.value.toLowerCase() === '#4f7cff' ? '#ff6b8b' : '#4f7cff';
      }
      if ((inp.type === 'checkbox' ? inp.checked : inp.value) !== before) changed[name] = 1;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    return changed;
  };

  function consoleHTML(c, maxLines) {
    if (!c) return '';
    const parts = [];
    let lines = 0, cut = 0;
    [...c.childNodes].forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.classList.contains('c-ask')) return;
      if (n.classList.contains('c-note') && /Press <b>Run|Press Run|This is what the program printed|asks you questions|Move the controls/.test(n.innerHTML)) return;
      if (lines >= maxLines) { cut += (n.textContent.match(/\n/g) || []).length; return; }
      if (n.tagName === 'SPAN') {
        const t = n.textContent.split('\n');
        if (lines + t.length - 1 > maxLines) {
          const keep = t.slice(0, maxLines - lines);
          cut += t.length - keep.length;
          parts.push('<span class="' + n.className + '">' + esc(keep.join('\n')) + '\n</span>');
          lines = maxLines;
          return;
        }
        lines += t.length - 1;
        parts.push('<span class="' + n.className + '">' + esc(n.textContent) + '</span>');
      } else {
        parts.push(n.outerHTML);
      }
    });
    if (cut) parts.push('<div class="c-note">… and ' + cut + ' more lines.</div>');
    return parts.join('');
  }
  function status(b) {
    const s = b.querySelector('.run-status');
    if (!s) return null;
    let st = s.getAttribute('data-state'), text = s.textContent;
    if (st === 'done' || text === 'Saved result') { st = 'done'; text = 'Finished'; }
    return { state: st, text };
  }

  // Everything needed to draw a runner, explorer or stepper without JavaScript
  BK.runner = k => {
    const b = bench(k);
    const tabs = [...b.querySelectorAll('.pg-code .pg-tab')];
    const files = [];
    const ed = b.querySelector('.pg-code .ed');
    tabs.forEach((t, i) => { if (tabs.length > 1) t.click(); files.push(editorInfo(ed, t.textContent)); });
    if (tabs.length > 1) tabs[0].click();
    const diag = b.querySelector('.diag');
    const stdin = b.querySelector('.stdin-box textarea');
    const turtle = b.querySelector('.turtle-stage');
    return {
      files,
      diag: diag && !diag.hidden ? diag.innerHTML : '',
      stdin: stdin ? stdin.value : null,
      status: status(b),
      console: consoleHTML(b.querySelector('.console'), 60),
      turtle: !!(turtle && !turtle.hidden && turtle.querySelector('canvas')),
      page: !!b.querySelector('.frame-wrap')
    };
  };
  BK.explorer = (k, changed) => {
    const b = bench(k);
    const turtle = b.querySelector('.turtle-stage');
    return {
      settings: settings(b, changed),
      code: b.querySelector('.ex-code').innerHTML,
      status: status(b),
      console: consoleHTML(b.querySelector('.console'), 40),
      turtle: !!(turtle && !turtle.hidden && turtle.querySelector('canvas')),
      page: !!b.querySelector('.frame-wrap')
    };
  };
  BK.stepper = k => {
    const b = bench(k);
    const btns = b.querySelectorAll('.step-ctrls button');
    const next = btns[1], restart = btns[3];
    restart.click();
    const rows = [...b.querySelectorAll('.step-line')];
    const lines = rows.map(r => r.querySelector('.lc').innerHTML);
    const steps = [];
    for (let guard = 0; guard < 500; guard++) {
      const cur = b.querySelector('.step-line.current');
      steps.push({
        line: cur ? rows.indexOf(cur) + 1 : 0,
        note: b.querySelector('.step-note').innerHTML,
        vars: b.querySelector('.step-vars').innerHTML,
        out: b.querySelector('.step-out').textContent
      });
      if (next.disabled) break;
      next.click();
    }
    restart.click();
    return { lines, steps };
  };

  /* ----- drawing the static versions ----- */
  const KIND = { 'Try it': 'Example', 'Playground': 'Example', 'Explorer': 'Explorer', 'Step through': 'Step by step' };
  function titleHTML(b, kind) {
    const k = b.querySelector('.bench-title .kind');
    const t = b.querySelector('.bench-title strong');
    if (!t) return '';
    const label = kind || KIND[k ? k.textContent : ''] || (k ? k.textContent : 'Example');
    return '<div class="bench-title"><span class="kind">' + esc(label) + '</span><strong>' + esc(t.textContent) + '</strong></div>';
  }
  function codeHTML(f) {
    return '<div class="pg-code"><div class="pg-bar"><span class="pg-tab" aria-selected="true">' + esc(f.name) + '</span></div>' +
      '<div class="ed"><div class="ed-gutter">' + f.gutter + '</div><div class="ed-main"><pre class="ed-hl"><code>' + f.code + '</code></pre></div></div></div>';
  }
  function browserHTML(v) {
    return '<div class="static-browser' + (v.narrow ? ' narrow' : '') + '">' +
      '<div class="pg-bar browser-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<div class="address"><span class="page-title">' + esc(v.title || '') + '</span><span class="url">' + esc(v.url || '') + '</span></div>' +
      (v.label ? '<span class="shot-label">' + esc(v.label) + '</span>' : '') + '</div>' +
      '<div class="shot-wrap"><img class="shot" src="@@SHOT:' + v.shot.id + '@@" width="' + v.shot.w + '" height="' + v.shot.h + '" alt="' + esc(v.alt || 'The website this code makes') + '"></div></div>';
  }
  function turtleHTML(shot) {
    return '<div class="static-turtle"><img src="@@SHOT:' + shot.id + '@@" width="' + shot.w + '" height="' + shot.h + '" alt="The drawing this program makes"></div>';
  }
  function statusHTML(s) {
    return s ? '<span class="run-status" data-state="' + esc(s.state) + '">' + esc(s.text) + '</span>' : '';
  }
  function outputHTML(r, label) {
    let h = '<div class="pg-view run-view"><div class="pg-bar run-bar"><span class="pg-label">' + label + '</span>' + statusHTML(r.status) + '</div>';
    if (r.stdin != null && r.stdin !== '') h += '<div class="static-stdin"><span class="step-label">Typed in for <code>cin</code> before running</span><pre>' + esc(r.stdin) + '</pre></div>';
    (r.views || []).forEach(v => { h += browserHTML(v); });
    if (r.turtleShot) h += turtleHTML(r.turtleShot);
    if (r.console) h += '<div class="console' + (r.page ? ' console-small' : '') + '">' + r.console + '</div>';
    else if (!r.turtleShot && !(r.views || []).length) h += '<div class="console"><div class="c-note">(no output)</div></div>';
    return h + '</div>';
  }
  function settingsHTML(list, label) {
    return '<div class="static-settings"><span class="step-label">' + esc(label) + '</span><div class="chips">' +
      list.map(s => '<span class="chip' + (s.changed ? ' changed' : '') + '"><code>' + esc(s.name) + '</code> ' + esc(s.value) + '</span>').join('') + '</div></div>';
  }

  const R = {};
  R.pg = (b, d) => '<div class="bench static-bench">' + titleHTML(b) + '<div class="pg stack static">' +
    d.files.map(codeHTML).join('') +
    '<div class="pg-view">' + d.views.map(browserHTML).join('') + '</div></div></div>';
  R.run = (b, d) => {
    const label = d.page ? 'Result' : 'Output';
    let h = '<div class="bench static-bench">' + titleHTML(b) + '<div class="pg stack static runner">';
    d.files.forEach((f, i) => { h += codeHTML(f); if (i === 0 && d.diag) h += '<div class="diag">' + d.diag + '</div>'; });
    return h + outputHTML(d, label) + '</div></div>';
  };
  R.hx = (b, d) => '<div class="bench static-bench">' + titleHTML(b) +
    (d.states.length > 1 ? '<p class="static-intro">The same explorer twice: first as it starts, then with the controls moved. The changed values are marked.</p>' : '') +
    d.states.map((s, i) => '<div class="ex static">' + settingsHTML(s.settings, i ? 'With the controls moved' : 'As it starts') +
      '<div class="ex-body"><pre class="ex-code">' + s.code + '</pre><div class="pg-view">' + s.views.map(browserHTML).join('') + '</div></div></div>').join('') + '</div>';
  R.cx = (b, d) => '<div class="bench static-bench">' + titleHTML(b) +
    (d.states.length > 1 ? '<p class="static-intro">The same explorer twice: first as it starts, then with the controls moved. The changed values are marked.</p>' : '') +
    d.states.map((s, i) => '<div class="ex static">' + settingsHTML(s.settings, i ? 'With the controls moved' : 'As it starts') +
      '<div class="ex-body"><pre class="ex-code">' + s.code + '</pre>' + outputHTML(s, 'Output') + '</div></div>').join('') + '</div>';
  R.step = (b, d) => {
    let prevOut = '';
    let h = '<div class="bench static-bench stepper-static">' + titleHTML(b, 'Step by step') +
      '<div class="step-whole"><div class="step-label">The whole program</div><div class="step-code">' +
      d.lines.map((l, i) => '<div class="step-line"><span class="ln">' + (i + 1) + '</span><span class="lc">' + (l || ' ') + '</span></div>').join('') +
      '</div></div><ol class="stages">';
    d.steps.forEach((s, i) => {
      const outChanged = s.out !== prevOut;
      prevOut = s.out;
      h += '<li class="stage"><div class="stage-head"><span class="stage-num">Stage ' + (i + 1) + ' of ' + d.steps.length + '</span>' +
        (s.line ? '<span class="stage-line">line ' + s.line + '</span>' : '') + '</div>' +
        (s.line ? '<div class="step-code stage-code"><div class="step-line current"><span class="ln">' + s.line + '</span><span class="lc">' + (d.lines[s.line - 1] || ' ') + '</span></div></div>' : '') +
        (s.note ? '<div class="step-note">' + s.note + '</div>' : '') +
        '<div class="stage-mem"><div class="step-label">Memory (the variables)</div><div class="step-vars">' + s.vars + '</div></div>' +
        (s.out && outChanged ? '<div class="stage-out"><div class="step-label">Output so far</div><pre class="step-out">' + esc(s.out) + '</pre></div>' : '') +
        '</li>';
    });
    return h + '</ol></div>';
  };

  function staticQuiz(q) {
    const label = q.querySelector('.eyebrow');
    const question = q.querySelector('.q');
    const why = q.querySelector('.why');
    const opts = [...q.querySelectorAll('.opts button')];
    const right = opts.filter(o => o.hasAttribute('data-correct'));
    const div = document.createElement('div');
    div.className = 'quiz static-quiz';
    div.innerHTML = '<p class="eyebrow">' + (label ? label.textContent : 'Quick check') + '</p>' +
      (question ? question.outerHTML : '') +
      '<ul class="static-opts">' + opts.map(o => '<li' + (o.hasAttribute('data-correct') ? ' class="right"' : '') + '>' +
        (o.hasAttribute('data-correct') ? '<span class="mark" aria-label="Correct">✓</span> ' : '') + o.innerHTML + '</li>').join('') + '</ul>' +
      '<p class="why"><b>Answer: ' + right.map(o => o.innerHTML).join(' / ') + '.</b> ' + (why ? why.innerHTML : '') + '</p>';
    q.replaceWith(div);
  }

  // Replace every interactive part with its static version; return the finished HTML
  BK.finish = (sel, data, links) => {
    const root = document.querySelector(sel);
    Object.keys(data).forEach(k => {
      const b = bench(k);
      const d = data[k];
      if (!b || !R[d.type]) return;
      const t = document.createElement('template');
      t.innerHTML = R[d.type](b, d);
      b.replaceWith(t.content);
    });
    root.querySelectorAll('.bench:not(.static-bench)').forEach(b => b.remove());
    root.querySelectorAll('.quiz').forEach(staticQuiz);
    root.querySelectorAll('.lesson-end, .bench-hint, .copy-btn, #cheat-filter, label[for="cheat-filter"], .cta-row, .c-ask, .pager').forEach(x => x.remove());
    root.querySelectorAll('.snippet-wrap .mini-btn').forEach(x => x.remove());
    root.querySelectorAll('button').forEach(btn => {
      const s = document.createElement('span');
      s.className = (btn.className + ' was-button').trim();
      if (btn.getAttribute('style')) s.setAttribute('style', btn.getAttribute('style'));
      s.innerHTML = btn.innerHTML;
      btn.replaceWith(s);
    });
    root.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (/^(https?:|mailto:)/i.test(h)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); return; }
      const abs = a.href.split('#')[0];
      if (links[abs]) { a.setAttribute('href', '#' + links[abs]); a.removeAttribute('target'); return; }
      const s = document.createElement('span');
      s.className = 'was-link';
      s.innerHTML = a.innerHTML;
      a.replaceWith(s);
    });
    root.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    root.querySelectorAll('[for]').forEach(x => x.removeAttribute('for'));
    root.querySelectorAll('[aria-live], [aria-controls], [aria-expanded]').forEach(x => { x.removeAttribute('aria-live'); x.removeAttribute('aria-controls'); x.removeAttribute('aria-expanded'); });
    root.querySelectorAll('script, iframe, textarea, input, select, canvas, noscript').forEach(x => x.remove());
    root.querySelectorAll('[hidden]').forEach(x => x.remove());
    let html = root.innerHTML;
    html = html.replace(/ Type in the box to find what you need\./g, '').replace(/ Click any swatch to copy its name\./g, '');
    return html;
  };
}

/* ---------------- the build ---------------- */
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 1600 }, deviceScaleFactor: SCALE, colorScheme: 'light', reducedMotion: 'reduce' });
  const conv = await ctx.newPage();
  await conv.setContent('<!DOCTYPE html><title>convert</title>');

  const SHOTS = [];
  const seen = new Map();
  async function shot(locator) {
    await locator.scrollIntoViewIfNeeded();
    const buf = await locator.screenshot({ animations: 'disabled' });
    const res = await conv.evaluate(async ([b64, q]) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return { url: c.toDataURL('image/webp', q), w: img.naturalWidth, h: img.naturalHeight };
    }, [buf.toString('base64'), QUALITY]);
    let id = seen.get(res.url);
    if (id == null) { id = SHOTS.length; SHOTS.push(res.url); seen.set(res.url, id); }
    return { id, w: Math.round(res.w / SCALE), h: Math.round(res.h / SCALE) };
  }

  // Map every course page to its place in the book
  const courses = COURSES.map(c => ({ ...c, ...loadCourse(c) }));
  const links = {};
  const pageUrl = (c, file) => 'file://' + path.join(ROOT, c.dir, file);
  courses.forEach(c => {
    links[pageUrl(c, 'index.html')] = c.key;
    c.lessons.forEach(l => { links[pageUrl(c, 'lessons/' + l.id + '.html')] = c.key + '-' + l.id; });
    links[pageUrl(c, 'lessons/cheatsheet.html')] = c.key + '-cheatsheet';
  });

  const log = (...a) => console.log(...a);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function waitIdle(p, extra) {
    let calm = 0;
    const t0 = Date.now();
    while (calm < 3 && Date.now() - t0 < 90000) {
      await sleep(300);
      calm = (await p.evaluate(() => BK.busy())) ? 0 : calm + 1;
    }
    if (extra) await sleep(extra);
  }
  async function waitEnd(p, k, ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const st = await p.evaluate(k => BK.state(k), k);
      if (st !== 'run') return st;
      await sleep(250);
    }
    return 'timeout';
  }

  async function answer(p, b) {
    const plan = (ANSWERS[b.title] || []).slice();
    const guessing = /Guess the number/.test(b.title);
    let lo = 1, hi = 20, guess = 0, seenText = '';
    await p.evaluate(k => BK.click(k, '.run-btn'), b.k);
    for (let n = 0; n < 40; n++) {
      const st = await waitEnd(p, b.k, 15000);
      if (st !== 'ask') break;
      let a;
      if (guessing) {
        const text = await p.evaluate(k => BK.text(k), b.k);
        const fresh = text.slice(seenText.length);
        seenText = text;
        if (guess) { if (/Too low/.test(fresh)) lo = guess + 1; else if (/Too high/.test(fresh)) hi = guess - 1; }
        guess = Math.floor((lo + hi) / 2);
        a = String(guess);
      } else {
        a = plan.length ? plan.shift() : 'q';
      }
      const inp = p.locator('[data-bk="' + b.k + '"] .c-ask input');
      await inp.fill(a);
      await inp.press('Enter');
      await sleep(120);
    }
    await sleep(300);
  }

  async function websiteViews(p, b, i, devices) {
    const url = await p.evaluate(k => BK.page(k), b.k);
    const title = await p.evaluate(([k, i]) => BK.frameTitle(k, i), [b.k, i]);
    const frame = p.locator('[data-bk="' + b.k + '"] .frame-wrap').nth(i).locator('iframe');
    const views = [];
    if (devices) {
      for (const [n, label, narrow] of [[0, 'Phone · 375px wide', true], [1, 'Tablet · 768px wide (shrunk to fit)', false], [2, 'Laptop · 1280px wide (shrunk to fit)', false]]) {
        await p.evaluate(([k, n]) => BK.device(k, n), [b.k, n]);
        await sleep(200);
        await p.evaluate(([k, i]) => BK.grow(k, i, 1300), [b.k, i]);
        await sleep(250);
        views.push({ url, title, label, narrow, shot: await shot(frame) });
        await p.evaluate(k => BK.ungrow(k), b.k);
      }
      await p.evaluate(([k, n]) => BK.device(k, n), [b.k, 3]);
      await sleep(150);
    } else {
      await p.evaluate(([k, i]) => BK.grow(k, i, 1300), [b.k, i]);
      await sleep(250);
      views.push({ url, title, shot: await shot(frame) });
      await p.evaluate(k => BK.ungrow(k), b.k);
    }
    return views;
  }

  async function capture(p, b, lang) {
    const loc = p.locator('[data-bk="' + b.k + '"]');
    if (b.type === 'pg') {
      const files = [], views = [];
      for (let i = 0; i < b.tabs; i++) {
        const f = await p.evaluate(([k, i]) => BK.selectTab(k, i), [b.k, i]);
        files.push(f);
        if (/\.html$/.test(f.name)) {
          await sleep(450);
          views.push(...await websiteViews(p, b, 0, b.devices));
        }
      }
      if (!views.length) { await sleep(400); views.push(...await websiteViews(p, b, 0, b.devices)); }
      if (b.tabs > 1) await p.evaluate(k => BK.selectTab(k, 0), b.k);
      return { type: 'pg', files, views };
    }
    if (b.type === 'run') {
      const d = await p.evaluate(k => BK.runner(k), b.k);
      d.type = 'run';
      if (d.turtle) { await sleep(400); d.turtleShot = await shot(loc.locator('.turtle-stage')); }
      if (d.page) {
        d.views = await websiteViews(p, b, 0, false);
        const label = lang === 'typescript' ? await p.evaluate(k => BK.pressButton(k), b.k) : null;
        if (label != null) {
          await sleep(700);
          const after = await websiteViews(p, b, 0, false);
          if (after[0].shot.id !== d.views[0].shot.id) {
            d.views[0].label = 'At the start';
            after[0].label = 'After clicking "' + label + '"';
            d.views.push(after[0]);
          }
        }
      }
      return d;
    }
    if (b.type === 'step') return { type: 'step', ...await p.evaluate(k => BK.stepper(k), b.k) };
    if (b.type === 'hx' || b.type === 'cx') {
      const states = [];
      for (let round = 0; round < 2; round++) {
        let changed = null;
        if (round === 1) {
          changed = await p.evaluate(k => BK.vary(k), b.k);
          if (!Object.keys(changed).length) break;
          await sleep(350);
        }
        if (b.type === 'cx') {
          if (lang === 'cpp') { await p.evaluate(k => BK.click(k, '.run-btn'), b.k); await sleep(300); await waitEnd(p, b.k, 60000); }
          else { await sleep(300); await waitIdle(p); }
        } else {
          await sleep(450);
        }
        const s = await p.evaluate(([k, c]) => BK.explorer(k, c), [b.k, changed]);
        if (s.turtle) { await sleep(400); s.turtleShot = await shot(loc.locator('.turtle-stage')); }
        if (s.page) s.views = await websiteViews(p, b, 0, false);
        states.push(s);
      }
      return { type: b.type, states };
    }
    return null;
  }

  async function processPage(c, file, rootSel) {
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(pageUrl(c, file));
    await sleep(400);
    await p.evaluate(pageHelpers);
    const benches = await p.evaluate(sel => BK.list(sel), rootSel);
    // 1. bring every example into view, so the ones that run by themselves start
    for (const b of benches) {
      await p.locator('[data-bk="' + b.k + '"]').scrollIntoViewIfNeeded();
      await sleep(40);
    }
    await waitIdle(p, c.lang === 'typescript' ? 3500 : 300);
    // 2. examples that need answers or a press of Run
    for (const b of benches) {
      if (b.type !== 'run' || !b.needs) continue;
      if (/asks you questions/.test(b.needs)) { await answer(p, b); continue; }
      if (/Press Run|compile/.test(b.needs)) {
        await p.evaluate(k => BK.click(k, '.run-btn'), b.k);
        await sleep(300);
        const st = await waitEnd(p, b.k, c.lang === 'cpp' ? 60000 : 6000);
        if (st === 'timeout') {
          if (c.lang === 'cpp') log('   ! C++ example did not finish:', b.title);
          await p.evaluate(k => BK.stop(k), b.k);
          await sleep(400);
        }
        if (c.lang === 'typescript') await sleep(800);
      }
    }
    // 3. take pictures and collect everything
    const data = {};
    for (const b of benches) {
      const d = await capture(p, b, c.lang);
      if (d) data[b.k] = d;
    }
    const html = await p.evaluate(([sel, data, links]) => BK.finish(sel, data, links), [rootSel, data, links]);
    if (errors.length) log('   ! page errors:', errors.join(' | '));
    await p.close();
    return { html, count: benches.length };
  }

  /* ----- go through every course ----- */
  // For testing: BOOK_ONLY="python:09-lists,html" builds only those lessons
  const ONLY = process.env.BOOK_ONLY ? process.env.BOOK_ONLY.split(',') : null;
  const parts = [];
  for (const c of courses) {
    if (ONLY && !ONLY.some(o => o.split(':')[0] === c.key)) continue;
    log('== ' + c.name);
    const hero = await processPage(c, 'index.html', '.home-hero');
    const lessons = [];
    const all = c.lessons.concat([{ id: 'cheatsheet', title: 'Cheat Sheet', group: 'build', chip: 'all', blurb: 'Everything from the course on one page.' }]);
    for (const l of all) {
      if (ONLY && !ONLY.includes(c.key) && !ONLY.includes(c.key + ':' + l.id)) continue;
      const t0 = Date.now();
      const r = await processPage(c, 'lessons/' + l.id + '.html', 'main.lesson');
      lessons.push({ ...l, html: r.html });
      log('   ' + l.id.padEnd(22) + String(r.count).padStart(3) + ' examples  ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
    parts.push({ c, hero: hero.html, lessons });
  }
  await browser.close();

  /* ----- put the book together ----- */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const num = id => (/^(\d\d)-/.exec(id) || [])[1];
  let css = fs.readFileSync(path.join(ROOT, 'assets/course.css'), 'utf8');
  css += fs.readFileSync(path.join(__dirname, 'reading-book.css'), 'utf8');

  const toc = parts.map((pt, n) => '<li class="toc-part"><a class="toc-course" href="#' + pt.c.key + '"><span class="toc-n">Part ' + (n + 1) + '</span><strong>' + esc(pt.c.label) + '</strong><span class="toc-what">' + esc(pt.c.what) + '</span></a>' +
    '<ol class="toc-lessons">' + pt.lessons.map(l => '<li><a href="#' + pt.c.key + '-' + l.id + '"><span class="num">' + (num(l.id) || '★') + '</span>' + esc(l.title) + '</a></li>').join('') + '</ol></li>').join('');

  let body = '';
  parts.forEach((pt, n) => {
    const c = pt.c;
    const next = parts[n + 1];
    body += '<section class="book-part" id="' + c.key + '" data-group="basics">' +
      '<p class="part-n">Part ' + (n + 1) + ' of ' + parts.length + '</p>' +
      '<div class="home-hero">' + pt.hero + '</div>' +
      '<h2 class="part-list-title">The ' + esc(c.label) + ' lessons</h2>' +
      '<ol class="part-lessons">' + pt.lessons.map(l => '<li><a href="#' + c.key + '-' + l.id + '"><span class="chip-code">' + esc(l.chip || '') + '</span><span><strong>' + (num(l.id) ? num(l.id) + ' · ' : '') + esc(l.title) + '</strong><small>' + esc(l.blurb || '') + '</small></span></a></li>').join('') + '</ol>' +
      '</section>';
    pt.lessons.forEach((l, i) => {
      const after = pt.lessons[i + 1];
      const nextHref = after ? '#' + c.key + '-' + after.id : (next ? '#' + next.c.key : '#contents');
      const nextText = after ? 'Next: ' + (num(after.id) ? num(after.id) + ' · ' : '') + after.title : (next ? 'Next: Part ' + (n + 2) + ', ' + next.c.label : 'Back to the contents');
      body += '<article class="lesson book-lesson" id="' + c.key + '-' + l.id + '" data-group="' + (l.group || 'build') + '">' +
        '<p class="book-crumb"><a href="#' + c.key + '">Part ' + (n + 1) + ' · ' + esc(c.label) + '</a></p>' +
        l.html +
        '<p class="book-next"><a href="' + nextHref + '">' + esc(nextText) + ' ↓</a><a href="#contents">↑ Contents</a></p>' +
        '</article>';
    });
  });

  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="color-scheme" content="light dark">\n' +
    '<title>Hello Courses · the reading book</title>\n<style>\n' + css + '\n</style>\n</head>\n' +
    '<body class="book-body" data-group="basics">\n<div class="book">\n' +
    '<header class="book-cover">' +
    '<p class="eyebrow">Hello Courses · the reading book</p>' +
    '<h1>Learn to code by <span class="tagword">reading</span> and <span class="tagword alt">seeing</span></h1>' +
    '<p class="lead">Four beginner courses in one page: <strong>HTML &amp; CSS</strong>, <strong>Python</strong>, <strong>C++</strong> and <strong>TypeScript</strong>. Just scroll down. Every lesson is here, one after another, and every example shows its code together with the result it makes.</p>' +
    '<div class="cover-notes">' +
    '<div><b>Websites and drawings</b> are shown as pictures, right under their code.</div>' +
    '<div><b>Program output</b> is written under each program. Programs that ask questions show sample answers in <span class="c-in">blue</span>.</div>' +
    '<div><b>Step by step</b> examples are written out as stages: read them going down to watch a program run one line at a time.</div>' +
    '<div><b>Quick checks</b> have their answer written underneath. Try to answer before you read it!</div>' +
    '</div>' +
    '<p class="cover-tip">This book needs nothing to run, so it works in any viewer, even the quick preview of the Files app. When a lesson says <em>"change the code"</em> or <em>"press Run"</em>, open the matching course file (<code>hello-html-course.html</code>, <code>hello-python-course.html</code>, <code>hello-cpp-course.html</code> or <code>hello-typescript-course.html</code>) in Safari to try it yourself.</p>' +
    '</header>\n' +
    '<nav class="book-toc" id="contents" aria-label="Contents"><h2>Contents</h2><ol class="toc">' + toc + '</ol></nav>\n' +
    body +
    '\n<footer class="book-end"><p>The end. Well done! 🎉 Now open a course in Safari and build something of your own.</p><p><a href="#contents">↑ Back to the contents</a></p></footer>\n' +
    '</div>\n</body>\n</html>\n';

  html = html.replace(/@@SHOT:(\d+)@@/g, (m, id) => SHOTS[+id]);
  if (/<script\b/i.test(html)) throw new Error('The book must not contain any <script> tags');
  if (/@@SHOT:/.test(html)) throw new Error('A picture placeholder was left in the book');
  fs.writeFileSync(OUT, html);
  log('\nWrote ' + path.relative(ROOT, OUT) + ': ' + (html.length / 1048576).toFixed(1) + ' MB, ' + SHOTS.length + ' pictures');
})().catch(e => { console.error(e); process.exit(1); });
