#!/usr/bin/env node
/*
  Renders a course video to MP4.

    node video/render.js html-course                    the whole video -> hello-html-course-video.mp4
    node video/render.js html-course --stills 5,12.5    pictures of single frames (for checking), in video/build/
    node video/render.js html-course --only 3,4         only some sections (0 = intro), for a quick test
    node video/render.js html-course --info             length and sections

  Needs Playwright with Chromium, ffmpeg, and Python 3 with numpy (for the soundtrack).
  Frames are drawn by the page (video/<name>.html): V.frame(t) is a pure function of
  time, so sections are rendered in parallel and joined at the end.
*/
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(__dirname, 'build');
const FPS = 30;
const args = process.argv.slice(2);
const NAME = args[0] || 'html-course';
const opt = k => { const i = args.indexOf('--' + k); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const OUT = path.resolve(opt('out') || path.join(ROOT, 'hello-' + NAME.replace(/-course$/, '') + '-course-video.mp4'));

function prepare() {
  fs.mkdirSync(BUILD, { recursive: true });
  // the course's own code colors (copied out of assets/course.js)
  const src = fs.readFileSync(path.join(ROOT, 'assets/course.js'), 'utf8');
  const a = src.indexOf('  var NAMES = ');
  const b = src.indexOf('  function highlight(code, lang)');
  const end = src.indexOf('\n', b);
  if (a < 0 || b < 0) throw new Error('Could not find the highlighter in assets/course.js');
  const hl = '/* made by video/render.js from assets/course.js */\n(function () {\n' +
    '  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }\n' +
    src.slice(a, end) + '\n  window.hlCode = highlight;\n})();\n';
  fs.writeFileSync(path.join(BUILD, 'highlight.js'), hl);
  // pictures and the final project's files
  const assets = {};
  for (const f of fs.readdirSync(path.join(ROOT, 'lessons/images'))) {
    assets['images/' + f] = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(ROOT, 'lessons/images', f)).toString('base64');
  }
  const files = {};
  for (const f of ['index.html', 'about.html', 'style.css']) files[f] = fs.readFileSync(path.join(ROOT, 'my-site', f), 'utf8');
  fs.writeFileSync(path.join(BUILD, 'assets.js'), 'window.VIDEO_ASSETS = ' + JSON.stringify(assets) + ';\nwindow.VIDEO_FILES = ' + JSON.stringify(files) + ';\n');
}

async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, NAME + '.html') + '?render');
  await p.waitForFunction(() => window.VIDEO && window.VIDEO.ready, null, { timeout: 60000 });
  if (errors.length) throw new Error('Page errors: ' + errors.join(' | '));
  p.errors = errors;
  return p;
}

async function drawFrame(p, t) {
  await p.evaluate(t => window.VIDEO.frame(t), t);
}

function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg failed: ' + file)))));
  return { ff, done };
}

(async () => {
  prepare();
  const browser = await chromium.launch();
  const main = await openPage(browser);
  const info = await main.evaluate(() => ({ duration: window.VIDEO.duration, sections: window.VIDEO.sections.map(s => ({ t0: s.t0, t1: s.t1, n: s.n, title: s.title })), events: window.VIDEO.events }));
  const D = info.duration;
  console.log('Length ' + Math.floor(D / 60) + ':' + String(Math.floor(D % 60)).padStart(2, '0') + ' (' + D.toFixed(1) + 's), ' + info.sections.length + ' sections');

  if (opt('info')) {
    const marks = await main.evaluate(() => window.VIDEO.marks || []);
    marks.forEach(m => console.log('   mark', m[0], m[1]));
    info.sections.forEach((s, i) => console.log(String(i).padStart(2), (s.n ? 'Lesson ' + s.n + ' ' + s.title : '(part)').padEnd(46), s.t0.toFixed(1).padStart(7), (s.t1 - s.t0).toFixed(1).padStart(6) + 's'));
    await browser.close();
    return;
  }

  if (opt('stills')) {
    const times = String(opt('stills')).split(',').map(Number);
    for (const t of times) {
      await drawFrame(main, t);
      const f = path.join(BUILD, 'still-' + t.toFixed(2) + '.png');
      await main.screenshot({ path: f });
      console.log('  ' + f);
    }
    if (main.errors.length) console.log('Page errors:', main.errors.join(' | '));
    await browser.close();
    return;
  }

  // sections become segments rendered in parallel
  const bounds = [0, ...info.sections.map(s => s.t0).filter(t => t > 0.01), D].sort((a, b) => a - b);
  let segs = [];
  for (let i = 0; i + 1 < bounds.length; i++) if (bounds[i + 1] - bounds[i] > 0.02) segs.push({ i: segs.length, t0: bounds[i], t1: bounds[i + 1] });
  if (opt('only')) { const only = String(opt('only')).split(',').map(Number); segs = segs.filter(s => only.includes(s.i)); }
  const workers = Math.max(1, Math.min(+opt('workers') || Math.max(1, os.cpus().length - 1), segs.length));
  const segDir = path.join(BUILD, 'segments');
  fs.rmSync(segDir, { recursive: true, force: true });
  fs.mkdirSync(segDir, { recursive: true });
  const queue = segs.slice().sort((a, b) => (b.t1 - b.t0) - (a.t1 - a.t0));
  const total = segs.reduce((a, s) => a + Math.round((s.t1 - s.t0) * FPS), 0);
  let doneFrames = 0;
  const t0 = Date.now();
  const timer = setInterval(() => {
    const pct = doneFrames / total, el = (Date.now() - t0) / 1000;
    console.log('  ' + (pct * 100).toFixed(1) + '% (' + doneFrames + '/' + total + ' frames), ' + Math.round(el) + 's, about ' + Math.round(el / Math.max(pct, 0.001) - el) + 's left');
  }, 30000);
  await main.context().close();
  await Promise.all(Array.from({ length: workers }, async () => {
    const p = await openPage(browser);
    while (queue.length) {
      const s = queue.shift();
      s.file = path.join(segDir, 'seg-' + String(s.i).padStart(3, '0') + '.mp4');
      const { ff, done } = encoder(s.file);
      const f0 = Math.round(s.t0 * FPS), f1 = Math.round(s.t1 * FPS);
      for (let f = f0; f < f1; f++) {
        await drawFrame(p, f / FPS);
        const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        doneFrames++;
      }
      ff.stdin.end();
      await done;
    }
    if (p.errors.length) console.log('Page errors:', p.errors.join(' | '));
    await p.context().close();
  }));
  clearInterval(timer);
  await browser.close();
  console.log('Frames done in ' + Math.round((Date.now() - t0) / 1000) + 's');

  // join the segments
  const list = path.join(segDir, 'list.txt');
  fs.writeFileSync(list, segs.sort((a, b) => a.i - b.i).map(s => "file '" + s.file + "'").join('\n') + '\n');
  const silent = path.join(BUILD, 'video-silent.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);

  // the soundtrack
  const evFile = path.join(BUILD, 'events.json');
  const start = segs.length ? segs[0].t0 : 0;
  const length = segs.reduce((a, s) => a + Math.round((s.t1 - s.t0) * FPS) / FPS, 0);
  const keep = opt('only') ? info.events.filter(e => segs.some(s => e.t >= s.t0 && e.t < s.t1)) : info.events;
  fs.writeFileSync(evFile, JSON.stringify({ duration: length, offset: opt('only') ? start : 0, events: opt('only') ? [] : keep }));
  const wav = path.join(BUILD, 'audio.wav');
  execFileSync('python3', [path.join(__dirname, 'audio.py'), evFile, wav], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', OUT]);
  const mb = fs.statSync(OUT).size / 1048576;
  console.log('Wrote ' + path.relative(ROOT, OUT) + ' (' + mb.toFixed(1) + ' MB)');
})().catch(e => { console.error(e); process.exit(1); });
