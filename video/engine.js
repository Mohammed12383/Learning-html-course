/*
  Hello Courses video engine.

  Everything on screen is a pure function of time: V.frame(t) draws the frame at
  t seconds, in any order. That lets tools/render.js draw frames in parallel and
  turn them into an MP4.

  A course script (for example html-course.js) builds the video with:
    V.intro / V.lesson(...) / V.outro          scenes, one after another
    L.say(text)                                a caption (time to read it is added)
    L.bench({...})                             code editor + live website, side by side
      b.type(text, {after|before|replace})     typing, with the website updating as you type
      b.callout(target, text)                  a label with an arrow
      b.box(selector), b.ruler(selector)       the box model and sizes, drawn on the website
    L.cards([...]), L.title(), L.remember([...])
*/
(function () {
  'use strict';
  const W = 1920, H = 1080;
  const ease = {
    linear: p => p,
    out: p => 1 - Math.pow(1 - p, 3),
    in: p => p * p * p,
    inOut: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    back: p => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    soft: p => 1 - Math.pow(1 - p, 2)
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // caption markup: *bold* and `code`
  const rich = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<b>$1</b>');
  const words = s => String(s).replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const readTime = s => clamp(1.5 + words(s) * 0.36, 2.6, 10);
  const graphemes = s => (window.Intl && Intl.Segmenter ? [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].map(x => x.segment) : Array.from(s));

  function el(tag, cls, html, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- Anim: opacity / move / scale / rotate keyframes for one element ---------- */
  class Anim {
    constructor(e, start, end) { this.e = e; this.start = start; this.end = end; this.segs = []; this.base = { o: 1, x: 0, y: 0, s: 1, r: 0 }; this.last = null; this.vis = null; this.disp = e.style.display || ''; }
    from(t, d, props, e) { for (const k in props) this.segs.push({ k, t0: t, t1: t + d, v0: props[k], v1: null, e: e || ease.out, hold: true }); return this; }
    to(t, d, props, e) { for (const k in props) this.segs.push({ k, t0: t, t1: t + d, v0: null, v1: props[k], e: e || ease.inOut }); return this; }
    val(k, t, upto) {
      let v = this.base[k], first = true;
      const n = upto == null ? this.segs.length : upto;
      for (let i = 0; i < n; i++) {
        const s = this.segs[i];
        if (s.k !== k) continue;
        if (t < s.t0) { if (first && s.hold) v = s.v0; break; }
        first = false;
        const a = s.v0 != null ? s.v0 : this.val(k, s.t0, i);
        const b = s.v1 != null ? s.v1 : this.base[k];
        v = t >= s.t1 ? b : lerp(a, b, s.e((t - s.t0) / (s.t1 - s.t0)));
      }
      return v;
    }
    render(t) {
      const on = t >= this.start && t < this.end;
      if (on !== this.vis) { this.e.style.display = on ? this.disp : 'none'; this.vis = on; }
      if (!on) return;
      const o = this.val('o', t), x = this.val('x', t), y = this.val('y', t), s = this.val('s', t), r = this.val('r', t);
      const key = o + '|' + x + '|' + y + '|' + s + '|' + r;
      if (key === this.last) return;
      this.last = key;
      this.e.style.opacity = String(clamp(o, 0, 1));
      this.e.style.transform = (x || y ? 'translate(' + x + 'px,' + y + 'px) ' : '') + (s !== 1 ? 'scale(' + s + ') ' : '') + (r ? 'rotate(' + r + 'deg)' : '');
    }
  }

  /* ---------- Video ---------- */
  class Video {
    constructor(stage, opts) {
      this.stage = stage;
      this.opts = opts || {};
      this.t = 0;
      this.anims = [];
      this.renders = [];
      this.events = [];
      this.captions = [];
      this.sections = [];      // [{t0, t1, group, n, title}]
      this.pending = [];
      this.measureCtx = document.createElement('canvas').getContext('2d');
      this.bg = el('div', 'layer', null, stage);
      this.scenes = el('div', 'layer', null, stage);
      this.top = el('div', 'topbar', null, stage);
      this.capWrap = el('div', 'caption-wrap', null, stage);
      this.cap = el('div', 'caption', null, this.capWrap);
      this.fx = el('div', 'layer', null, stage);
      this.buildBackground();
      this.buildTopbar();
      this.add(t => this.renderCaption(t), 2);
      this.add(t => this.renderChrome(t), 0);
    }
    anim(e, start, end) { const a = new Anim(e, start, end == null ? 1e9 : end); this.anims.push(a); return a; }
    add(fn, prio, start, end) { this.renders.push({ fn, prio: prio || 0, start: start == null ? -1e9 : start, end: end == null ? 1e9 : end }); this.renders.sort((a, b) => a.prio - b.prio); }
    sfx(t, type, extra) { this.events.push(Object.assign({ t: +t.toFixed(3), type }, extra || {})); }
    wait(s) { this.t += s; return this; }
    mark(name) { (this.marks = this.marks || []).push([name, +this.t.toFixed(2)]); }
    caption(text, t0, t1) { this.captions.push({ t0, t1, html: rich(text) }); }
    say(text, o) {
      o = o || {};
      const d = o.dur || readTime(text);
      this.caption(text, this.t, this.t + d);
      if (o.wait !== false) this.t += d + (o.pause == null ? 0.25 : o.pause);
      return d;
    }
    measure(text, font) { this.measureCtx.font = font; return this.measureCtx.measureText(text).width; }

    get duration() { return this.end || this.t; }

    frame(t) {
      this.pending = [];
      for (const a of this.anims) a.render(t);
      for (const r of this.renders) if (t >= r.start && t < r.end) r.fn(t);
      const p = this.pending;
      return p.length ? Promise.all(p).then(() => true, () => true) : true;
    }

    /* background: soft colored circles that drift slowly */
    buildBackground() {
      const spots = [[-140, -160, 760, 0.6], [1420, 560, 820, 0.45], [1180, -260, 560, 0.3], [-200, 700, 600, 0.3]];
      this.blobs = spots.map(([x, y, s, a], i) => {
        const b = el('div', 'blob', null, this.bg);
        b.style.width = b.style.height = s + 'px';
        b.style.left = x + 'px'; b.style.top = y + 'px';
        b.style.background = 'radial-gradient(circle, color-mix(in srgb, var(--g) ' + Math.round(a * 26) + '%, transparent) 0%, transparent 68%)';
        return { b, i };
      });
    }
    buildTopbar() {
      this.top.innerHTML = '<span class="logo"><span class="logo-mark">' + (this.opts.logo || '&lt;/&gt;') + '</span>' + esc(this.opts.name || 'Hello HTML') + '</span><span class="where"></span><span class="dots"></span>';
      this.whereEl = this.top.querySelector('.where');
      this.dotsEl = this.top.querySelector('.dots');
      this.topLast = null;
    }
    section(t) {
      for (const s of this.sections) if (t >= s.t0 && t < s.t1) return s;
      return null;
    }
    renderChrome(t) {
      const s = this.section(t);
      const g = s ? s.group : 'basics';
      if (this.stage.getAttribute('data-group') !== g) this.stage.setAttribute('data-group', g);
      this.blobs.forEach(({ b, i }) => {
        const x = Math.sin(t * 0.13 + i * 1.7) * 60, y = Math.cos(t * 0.11 + i * 2.3) * 50;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      // top bar: visible during lessons
      const key = s && s.lesson != null ? s.lesson : -1;
      if (key !== this.topLast) {
        this.topLast = key;
        if (key < 0) { this.top.style.display = 'none'; }
        else {
          this.top.style.display = '';
          this.whereEl.innerHTML = '<b>Lesson ' + esc(s.n) + '</b> · ' + esc(s.title);
          const total = this.sections.filter(x => x.lesson != null).length;
          let d = '';
          for (let i = 0; i < total; i++) d += '<i class="' + (i < key ? 'done' : i === key ? 'now' : '') + '"></i>';
          this.dotsEl.innerHTML = d;
        }
      }
      if (key >= 0) {
        const inP = clamp((t - s.t0 - 0.2) / 0.5, 0, 1), outP = clamp((s.t1 - t - 0.1) / 0.4, 0, 1);
        this.top.style.opacity = String(Math.min(inP, outP));
      }
    }
    renderCaption(t) {
      let c = null;
      for (const x of this.captions) if (t >= x.t0 && t < x.t1) c = x;
      if (!c) { if (this.capOn !== null) { this.capWrap.style.display = 'none'; this.capOn = null; } return; }
      if (this.capOn !== c) { this.cap.innerHTML = c.html; this.capWrap.style.display = ''; this.capOn = c; }
      const p = clamp((t - c.t0) / 0.28, 0, 1), q = clamp((c.t1 - t) / 0.22, 0, 1);
      const o = Math.min(ease.out(p), q);
      this.capWrap.style.opacity = String(o);
      this.capWrap.style.transform = 'translateY(' + ((1 - ease.out(p)) * 22).toFixed(1) + 'px)';
    }

    /* a shot: one full-screen picture; it fades in, and fades out when the next one starts */
    shot(cls) {
      const e = el('div', 'shot' + (cls ? ' ' + cls : ''), null, this.scenes);
      const a = this.anim(e, this.t, 1e9);
      a.from(this.t, 0.55, { o: 0, y: 26 }, ease.out);
      const s = { e, a, start: this.t, V: this };
      if (this.lastShot) this.closeShot(this.lastShot, this.t);
      this.lastShot = s;
      return s;
    }
    closeShot(s, t) {
      if (s.closed) return;
      s.closed = true;
      s.a.end = t + 0.45;
      s.a.to(t, 0.4, { o: 0 }, ease.inOut);
      s.end = t + 0.45;
    }
    // things inside a shot appear with a small pop
    pop(e, t, o) {
      o = o || {};
      const a = this.anim(e, -1e9, 1e9);
      a.from(t, o.d || 0.5, o.from || { o: 0, y: 30, s: 0.96 }, o.ease || ease.back);
      if (o.sfx !== false) this.sfx(t, 'pop');
      return a;
    }

    /* the colored sweep between lessons */
    wipe(t, group) {
      const w = el('div', 'wipe', null, this.fx);
      const w2 = el('div', 'wipe two', null, this.fx);
      if (group) { w.style.background = 'var(--c-' + ({ basics: 'tag', style: 'prop', parts: 'attr', layout: 'val', polish: 'sel', build: 'tag' }[group] || 'tag') + ')'; }
      const a = this.anim(w, t, t + 1.3), b = this.anim(w2, t + 0.08, t + 1.3);
      a.to(t, 0.55, { x: 2600 }, ease.inOut).to(t + 0.62, 0.6, { x: 5300 }, ease.inOut);
      b.to(t + 0.08, 0.5, { x: 2600 }, ease.inOut).to(t + 0.6, 0.6, { x: 5300 }, ease.inOut);
      this.sfx(t, 'whoosh');
      return t + 0.62;   // the moment the screen is covered
    }

    /* ---------- lessons ---------- */
    lesson(info, build) {
      const n = this.sections.filter(x => x.lesson != null).length;
      const covered = this.t > 0.5 ? this.wipe(this.t - 0.62, info.group) : this.t;
      this.t = Math.max(this.t, covered);
      const sec = { t0: this.t, t1: 0, group: info.group, n: info.n, title: info.title, lesson: n };
      this.sections.push(sec);
      const L = new Lesson(this, info);
      L.title();
      build(L);
      this.t += 0.3;
      sec.t1 = this.t;
      return L;
    }
    part(info, build) {
      const sec = { t0: this.t, t1: 0, group: info.group || 'basics' };
      this.sections.push(sec);
      const L = new Lesson(this, info);
      build(L);
      sec.t1 = this.t;
      return L;
    }
    finish() {
      if (this.lastShot) this.closeShot(this.lastShot, this.t);
      this.end = this.t + 0.5;
      const last = this.sections[this.sections.length - 1];
      if (last) last.t1 = this.end + 1;
      this.events.sort((a, b) => a.t - b.t);
    }
  }

  /* ---------- Lesson: helpers that build shots ---------- */
  class Lesson {
    constructor(V, info) { this.V = V; this.info = info; }
    get t() { return this.V.t; }
    set t(v) { this.V.t = v; }
    say(text, o) { return this.V.say(text, o); }
    wait(s) { this.V.t += s; return this; }

    title() {
      const V = this.V, i = this.info;
      const s = V.shot();
      const box = el('div', 'title-card', null, s.e);
      const num = el('div', 'num', '<span>' + esc(i.n) + '</span>', box);
      const eb = el('div', 'eyebrow', 'Lesson ' + esc(i.n) + ' · ' + esc(i.groupName || ''), box);
      const h = el('h1', null, esc(i.title), box);
      const chip = el('span', 'chip', esc(i.chip || ''), box);
      const learn = el('div', 'learn', (i.learn || []).map(x => '<span>' + esc(x) + '</span>').join(''), box);
      const t = V.t;
      V.pop(num, t, { from: { o: 0, s: 0.7, x: 120 }, d: 0.9, ease: ease.out, sfx: false });
      V.pop(eb, t + 0.15, { sfx: false });
      V.pop(h, t + 0.25, { from: { o: 0, y: 50 }, d: 0.7, ease: ease.out });
      V.pop(chip, t + 0.5, { from: { o: 0, s: 0.6 }, d: 0.6 });
      [...learn.children].forEach((c, k) => V.pop(c, t + 0.9 + k * 0.18, { from: { o: 0, y: 24, s: 0.9 }, sfx: k === 0 }));
      V.sfx(t + 0.05, 'chime');
      V.t += Math.max(4.6, 1.6 + (i.learn || []).length * 0.75);
      return s;
    }

    // centered big text (a "chapter card")
    big(html, sub, o) {
      o = o || {};
      const V = this.V, s = V.shot();
      const c = el('div', 'center', null, s.e);
      const inner = el('div', null, null, c);
      inner.style.display = 'grid'; inner.style.gap = '34px'; inner.style.justifyItems = 'center'; inner.style.maxWidth = '1600px';
      const h = el('div', 'big-title', html, inner);
      V.pop(h, V.t + 0.1, { from: { o: 0, y: 40, s: 0.95 }, d: 0.7 });
      if (sub) { const p = el('div', 'sub', sub, inner); V.pop(p, V.t + 0.5, { sfx: false }); }
      if (o.say) V.say(o.say); else V.t += o.dur || 3.4;
      return s;
    }

    // a row of cards that pop in one by one: [{ic, title, text, color}]
    cards(list, o) {
      o = o || {};
      const V = this.V, s = V.shot();
      const row = el('div', 'cards', null, s.e);
      if (o.top) row.style.top = o.top + 'px';
      list.forEach((c, k) => {
        const card = el('div', 'card', '<div class="ic">' + c.ic + '</div><h3>' + c.title + '</h3><p>' + c.text + '</p>', row);
        if (c.color) card.style.setProperty('--cc', c.color);
        const t = V.t + 0.2 + k * (o.gap || 1.2);
        V.pop(card, t, { from: { o: 0, y: 60, s: 0.9 }, d: 0.6 });
        if (c.say) V.caption(c.say, t, t + (o.gap || 1.2) + (k === list.length - 1 ? 2.6 : 0.05));
      });
      V.t += 0.4 + list.length * (o.gap || 1.2) + (o.hold == null ? 2.4 : o.hold);
      return s;
    }

    // free HTML shot; parts with data-pop appear in order (data-at="seconds" to pick a time)
    html(markup, o) {
      o = o || {};
      const V = this.V, s = V.shot();
      const box = el('div', 'layer', markup, s.e);
      const t0 = V.t;
      let k = 0;
      box.querySelectorAll('[data-pop]').forEach(p => {
        const at = p.hasAttribute('data-at') ? t0 + parseFloat(p.getAttribute('data-at')) : t0 + 0.3 + k * (o.gap || 0.7);
        k++;
        V.pop(p, at, { from: { o: 0, y: 30, s: 0.92 }, sfx: !p.hasAttribute('data-quiet') });
      });
      if (o.dur) V.t += o.dur;
      return { shot: s, box };
    }

    remember(points) {
      const V = this.V, s = V.shot();
      const box = el('div', 'remember', '<h2><span>★</span>Remember</h2><ul>' + points.map(p => '<li>' + rich(p) + '</li>').join('') + '</ul>', s.e);
      const t = V.t;
      V.pop(box.querySelector('h2'), t + 0.1, { sfx: false });
      [...box.querySelectorAll('li')].forEach((li, k) => V.pop(li, t + 0.5 + k * 0.9, { from: { o: 0, x: -40 }, d: 0.5, ease: ease.out }));
      V.sfx(t, 'chime');
      V.t += 1.2 + points.reduce((a, p) => a + Math.min(readTime(p), 4.2) * 0.62 + 0.5, 0);
      return s;
    }

    bench(o) { return new Bench(this.V, o || {}); }
  }

  /* ---------- turning lesson code into a live website inside the video ---------- */
  const BASE = ':host{all:initial;display:block}' +
    '.vp{container-type:size;container-name:vp;position:absolute;inset:0;overflow:hidden;background:#fff;color:#000;font:16px/normal "Liberation Serif",serif;scrollbar-width:none}' +
    '.vp::-webkit-scrollbar{display:none}' +
    ':where(.page){min-height:100%;padding:8px;box-sizing:border-box;display:flow-root}' +
    '.is-hover{cursor:pointer}';
  function transformCSS(css) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    css = css.replace(/@media\b/g, '@container vp');
    css = css.replace(/(\d)vw\b/g, '$1cqw').replace(/(\d)vh\b/g, '$1cqh');
    css = css.replace(/:hover\b/g, '.is-hover').replace(/:focus(-visible|-within)?\b/g, '.is-focus').replace(/:active\b/g, '.is-active');
    // html, body and :root become the page box
    css = css.replace(/(^|[{},>+~\s(])(html|body|:root)(?=[\s,.:#\[{>+~)]|$)/g, '$1.page');
    // the page box has no margin of its own: body margins become padding
    css = css.replace(/(^|[},]\s*)(\.page)(\s*\{)([^}]*)\}/g, (m, a, b, c, d) => a + b + c + d.replace(/(^|;|\s)margin(\s*:\s*)(?![^;]*auto)/g, '$1padding$2') + '}');
    return css;
  }

  /* ---------- Bench: code editor + website ---------- */
  class Bench {
    constructor(V, o) {
      this.V = V; this.o = o;
      const layout = o.layout || 'split';
      const top = o.top || 120, h = o.height || 730;
      this.edBox = layout === 'site' ? null : (o.ed || (layout === 'code' ? { x: 340, y: top, w: 1240, h } : { x: 70, y: top, w: 900, h }));
      this.brBox = layout === 'code' ? null : (o.br || (layout === 'site' ? { x: 230, y: top, w: 1460, h } : { x: 1000, y: top, w: 850, h }));
      this.shot = o.shot || V.shot();
      const s = this.shot.e;
      this.files = Object.assign({}, o.files || { 'index.html': '' });
      const names = Object.keys(this.files);
      this.init = { files: Object.assign({}, this.files), active: o.active || names[0], page: o.page || names.find(n => /\.html$/.test(n)) || names[0] };
      this.init.cursor = this.init.files[this.init.active].length;
      this.cur = JSON.parse(JSON.stringify(this.init));
      this.ops = [];
      this.hovers = [];
      this.scrollKeys = [];
      this.vwKeys = [];
      this.overlays = [];
      this.vw0 = o.viewport || null;
      this.LH = 42; this.FONT = '400 26px "JetBrains Mono"';
      if (this.edBox) this.buildEditor(s);
      if (this.brBox) this.buildBrowser(s);
      this.ov = el('div', 'ov', null, s);
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('width', W); this.svg.setAttribute('height', H);
      this.ov.appendChild(this.svg);
      const t = V.t;
      if (this.edP) V.pop(this.edP, t + 0.05, { from: { o: 0, x: -60 }, d: 0.7, ease: ease.out, sfx: false });
      if (this.brP) V.pop(this.brP, t + 0.18, { from: { o: 0, x: 60 }, d: 0.7, ease: ease.out, sfx: false });
      V.add(tt => this.render(tt), 0, this.shot.start, 1e9);
      V.add(tt => this.renderOverlays(tt), 1, this.shot.start, 1e9);
      V.t += o.delay == null ? 0.7 : o.delay;
    }
    place(e, b) { e.style.left = b.x + 'px'; e.style.top = b.y + 'px'; e.style.width = b.w + 'px'; e.style.height = b.h + 'px'; }
    buildEditor(s) {
      const p = this.edP = el('div', 'panel ed', null, s);
      this.place(p, this.edBox);
      this.tabsEl = el('div', 'ed-tabs', null, p);
      const body = this.edBody = el('div', 'ed-body', null, p);
      this.scrollEl = el('div', 'ed-scroll', null, body);
      this.flashEl = el('div', null, null, this.scrollEl);
      this.selEl = el('div', null, null, this.scrollEl);
      this.gutterEl = el('pre', 'ed-gutter', null, this.scrollEl);
      this.codeEl = el('pre', 'ed-code', null, this.scrollEl);
      this.caretEl = el('div', 'ed-caret', null, this.scrollEl);
      this.lastCode = null; this.lastTabs = null;
    }
    buildBrowser(s) {
      const p = this.brP = el('div', 'panel br', null, s);
      this.place(p, this.brBox);
      const bar = el('div', 'br-bar', '<span class="br-dots"><i></i><i></i><i></i></span><div class="br-addr"><b></b><span></span></div>', p);
      this.addrTitle = bar.querySelector('.br-addr b');
      this.addrUrl = bar.querySelector('.br-addr span');
      if (this.o.readout) this.readEl = el('span', 'br-read', null, bar);
      this.view = el('div', 'br-view' + (this.o.readout ? ' devices' : ''), null, p);
      this.host = el('div', 'br-host', null, this.view);
      this.root = this.host.attachShadow({ mode: 'open' });
      this.lastPage = null;
    }

    /* ----- building the timeline of edits ----- */
    pushOp(op, dur) {
      op.t0 = this.V.t; op.t1 = this.V.t + dur;
      op.before = JSON.parse(JSON.stringify(this.cur));
      this.ops.push(op);
      return op;
    }
    find(file, str, from) {
      const code = this.cur.files[file];
      const i = code.indexOf(str, from || 0);
      if (i < 0) throw new Error('Text not found in ' + file + ': ' + str);
      return i;
    }
    // where to insert: {after: 'text'} {before: 'text'} {at: index} or the end
    where(file, o) {
      const code = this.cur.files[file];
      if (o.after != null) return this.find(file, o.after) + o.after.length;
      if (o.before != null) return this.find(file, o.before);
      if (o.at != null) return o.at;
      if (o.atCursor) return this.cur.cursor;
      return code.length;
    }
    act(dur, o, run) {
      const V = this.V, start = V.t;
      run();
      const read = o.say ? readTime(o.say) : 0;
      if (o.say) V.caption(o.say, start, start + Math.max(dur + 0.6, read));
      if (o.wait !== false) V.t = start + Math.max(dur, read) + (o.pause == null ? 0.35 : o.pause);
      return start;
    }
    tab(name, o) {
      return this.act(0.35, o || {}, () => {
        const op = this.pushOp({ kind: 'tab' }, 0.01);
        this.cur.active = name; this.cur.cursor = this.cur.files[name].length;
        if (/\.html$/.test(name)) this.cur.page = name;
        op.after = JSON.parse(JSON.stringify(this.cur));
        this.V.sfx(op.t0, 'click');
      });
    }
    go(page, o) {
      return this.act(0.3, o || {}, () => {
        const op = this.pushOp({ kind: 'go' }, 0.01);
        this.cur.page = page;
        op.after = JSON.parse(JSON.stringify(this.cur));
      });
    }
    type(text, o) {
      o = o || {};
      const file = o.file || this.cur.active;
      if (file !== this.cur.active) this.tab(file, { pause: 0.15 });
      const cps = o.cps || 19;
      // typing units: one character (emoji count as one), or a new line with its indent
      const g = graphemes(text);
      const cuts = [];
      let pos = 0;
      for (let i = 0; i < g.length; i++) {
        pos += g[i].length;
        if (g[i] === '\n') { while (i + 1 < g.length && g[i + 1] === ' ') { i++; pos++; } }
        cuts.push(pos);
      }
      let a, b;
      if (o.replace != null) { a = this.find(file, o.replace, o.from ? this.find(file, o.from) : 0); b = a + o.replace.length; }
      else { a = b = this.where(file, o); }
      const sel = o.replace != null ? (o.select == null ? 0.55 : o.select) : 0;
      const dur = sel + cuts.length / cps;
      return this.act(dur, o, () => {
        const op = this.pushOp({ kind: 'type', file, a, b, text, cuts, sel }, dur);
        this.cur.files[file] = this.cur.files[file].slice(0, a) + text + this.cur.files[file].slice(b);
        this.cur.cursor = a + text.length;
        op.after = JSON.parse(JSON.stringify(this.cur));
        for (let k = 0; k < cuts.length; k++) this.V.sfx(op.t0 + sel + (k + 0.5) / cps, 'key');
      });
    }
    // put a whole block in at once (like pasting), then flash it
    paste(text, o) {
      o = o || {};
      const file = o.file || this.cur.active;
      if (file !== this.cur.active) this.tab(file, { pause: 0.15 });
      let a, b;
      if (o.replace != null) { a = this.find(file, o.replace); b = a + o.replace.length; } else { a = b = this.where(file, o); }
      return this.act(0.5, o, () => {
        const op = this.pushOp({ kind: 'paste', file, a, b, text }, 0.01);
        this.cur.files[file] = this.cur.files[file].slice(0, a) + text + this.cur.files[file].slice(b);
        this.cur.cursor = a + text.length;
        op.after = JSON.parse(JSON.stringify(this.cur));
        op.flash = [a, a + text.length];
        this.V.sfx(op.t0, 'pop');
      });
    }
    erase(str, o) {
      o = o || {};
      const file = o.file || this.cur.active;
      const a = this.find(file, str), b = a + str.length;
      const dur = 0.45 + Math.min(1.2, str.length / 40);
      return this.act(dur, o, () => {
        const op = this.pushOp({ kind: 'erase', file, a, b }, dur);
        this.cur.files[file] = this.cur.files[file].slice(0, a) + this.cur.files[file].slice(b);
        this.cur.cursor = a;
        op.after = JSON.parse(JSON.stringify(this.cur));
      });
    }
    // set all the code at once, without animation (for a fresh example)
    set(files, o) {
      o = o || {};
      return this.act(0.01, Object.assign({ pause: 0 }, o), () => {
        const op = this.pushOp({ kind: 'set' }, 0.01);
        this.cur.files = Object.assign({}, files);
        const names = Object.keys(files);
        this.cur.active = o.active || names[0];
        this.cur.page = o.page || names.find(n => /\.html$/.test(n)) || names[0];
        this.cur.cursor = this.cur.files[this.cur.active].length;
        op.after = JSON.parse(JSON.stringify(this.cur));
      });
    }
    hover(sel, o) {
      o = o || {};
      const t0 = this.V.t + (o.delay || 0), t1 = t0 + (o.dur || 2.5);
      this.hovers.push({ sel, t0, t1, cls: o.cls || 'is-hover' });
      if (o.cursor !== false) this.cursorTo(sel, t0 - 0.7, 0.65, t1);
      if (o.wait !== false) this.V.t = t1 + 0.2;
      return t0;
    }
    scroll(y, o) {
      o = o || {};
      this.scrollKeys.push({ t0: this.V.t, t1: this.V.t + (o.dur || 1.6), y });
      if (o.wait !== false) this.V.t += (o.dur || 1.6) + (o.pause == null ? 0.3 : o.pause);
    }
    viewport(w, o) {
      o = o || {};
      this.vwKeys.push({ t0: this.V.t, t1: this.V.t + (o.dur || 2), w });
      if (o.say) this.V.caption(o.say, this.V.t, this.V.t + Math.max((o.dur || 2) + 0.6, readTime(o.say)));
      if (o.wait !== false) this.V.t += Math.max(o.dur || 2, o.say ? readTime(o.say) : 0) + (o.pause == null ? 0.3 : o.pause);
    }

    /* ----- state at a time ----- */
    stateAt(t) {
      let op = null;
      for (let i = 0; i < this.ops.length; i++) { if (this.ops[i].t0 <= t) op = this.ops[i]; else break; }
      if (!op) return { s: this.init, sel: null, flash: null, busy: false };
      if (t >= op.t1) {
        const fl = op.flash && t < op.t1 + 0.9 ? { a: op.flash[0], b: op.flash[1], p: (t - op.t1) / 0.9 } : null;
        return { s: op.after, sel: null, flash: fl, busy: false };
      }
      const p = (t - op.t0) / (op.t1 - op.t0);
      const B = op.before;
      if (op.kind === 'type') {
        const tt = t - op.t0;
        const code = B.files[op.file];
        if (tt < op.sel) return { s: Object.assign({}, B, { active: op.file, cursor: op.b }), sel: [op.a, op.b], busy: true };
        const k = Math.floor((tt - op.sel) / (op.t1 - op.t0 - op.sel) * op.cuts.length);
        const c = k > 0 ? op.cuts[Math.min(k, op.cuts.length) - 1] : 0;
        const files = Object.assign({}, B.files);
        files[op.file] = code.slice(0, op.a) + op.text.slice(0, c) + code.slice(op.b);
        return { s: Object.assign({}, B, { files, active: op.file, cursor: op.a + c }), sel: null, busy: true };
      }
      if (op.kind === 'erase') {
        const code = B.files[op.file];
        const n = Math.round(ease.inOut(p) * (op.b - op.a));
        const files = Object.assign({}, B.files);
        files[op.file] = code.slice(0, op.b - n) + code.slice(op.b);
        return { s: Object.assign({}, B, { files, cursor: op.b - n }), sel: null, busy: true };
      }
      return { s: op.after, sel: null, busy: true };
    }

    /* ----- drawing ----- */
    render(t) {
      if (this.shot.end != null && t >= this.shot.end) return;
      const st = this.stateAt(t);
      this.state = st;
      if (this.edBox) this.renderEditor(t, st);
      if (this.brBox) this.renderSite(t, st.s);
    }
    lang(name) { return /\.css$/.test(name) ? 'css' : 'html'; }
    lineCol(code, pos) {
      const before = code.slice(0, pos);
      const line = (before.match(/\n/g) || []).length;
      const col = before.length - before.lastIndexOf('\n') - 1;
      return { line, col, lineText: before.slice(before.lastIndexOf('\n') + 1) };
    }
    renderEditor(t, st) {
      const s = st.s, code = s.files[s.active];
      const tabsKey = Object.keys(s.files).join('|') + '#' + s.active;
      if (tabsKey !== this.lastTabs) {
        this.lastTabs = tabsKey;
        this.tabsEl.innerHTML = Object.keys(s.files).map(n => '<span class="ed-tab' + (n === s.active ? ' on' : '') + '">' + esc(n) + '</span>').join('') + '<span class="ed-kind">' + (this.o.kind || 'Code') + '</span>';
      }
      if (code !== this.lastCode) {
        this.lastCode = code;
        this.codeEl.innerHTML = window.hlCode(code, this.lang(s.active)) + '\n';
        const n = code.split('\n').length;
        let g = '';
        for (let i = 1; i <= n; i++) g += i + '\n';
        this.gutterEl.textContent = g;
      }
      const LH = this.LH, padT = 22, codeX = 86;
      const lc = this.lineCol(code, s.cursor);
      const viewH = this.edBox.h - 70;
      const lines = code.split('\n').length;
      let scroll = 0;
      const caretBottom = padT + (lc.line + 1) * LH;
      if (caretBottom + LH * 1.5 > viewH) scroll = caretBottom + LH * 1.5 - viewH;
      scroll = Math.max(0, Math.min(scroll, padT * 2 + lines * LH - viewH + 10));
      if (this.o.scrollCode != null) scroll = this.o.scrollCode;
      this.scrollTop = scroll;
      this.scrollEl.style.transform = 'translateY(' + (-scroll) + 'px)';
      const x = codeX + this.V.measure(lc.lineText, this.FONT);
      this.caretEl.style.left = x + 'px';
      this.caretEl.style.top = (padT + lc.line * LH + 4) + 'px';
      const blink = st.busy || Math.floor(t * 2.2) % 2 === 0;
      this.caretEl.style.opacity = this.o.caret === false ? '0' : (blink ? '1' : '0');
      // selection
      if (st.sel) {
        const a = this.lineCol(code, st.sel[0]), b = this.lineCol(code, st.sel[1]);
        const x0 = codeX + this.V.measure(a.lineText, this.FONT);
        const x1 = a.line === b.line ? codeX + this.V.measure(b.lineText, this.FONT) : x0 + 200;
        this.selEl.className = 'ed-sel';
        this.selEl.style.cssText = 'left:' + (x0 - 3) + 'px;top:' + (padT + a.line * LH) + 'px;width:' + (x1 - x0 + 6) + 'px';
      } else this.selEl.className = '';
      if (st.flash) {
        const a = this.lineCol(code, st.flash.a), b = this.lineCol(code, st.flash.b);
        this.flashEl.className = 'ed-flash';
        this.flashEl.style.cssText = 'top:' + (padT + a.line * LH) + 'px;height:' + ((b.line - a.line + 1) * LH) + 'px;opacity:' + (1 - st.flash.p).toFixed(2);
      } else this.flashEl.className = '';
    }
    vwAt(t) {
      let w = this.vw0;
      for (const k of this.vwKeys) {
        if (t < k.t0) break;
        const from = w == null ? this.fitWidth() : w;
        w = t >= k.t1 ? k.w : lerp(from, k.w, ease.inOut((t - k.t0) / (k.t1 - k.t0)));
      }
      return w;
    }
    fitWidth() { return Math.round(this.brBox.w / (this.o.zoom || 1.25)); }
    renderSite(t, s) {
      // which page, and its code
      const files = s.files, page = s.page;
      let src = files[page] || '';
      src = src.replace(/<link\b[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (m, href) => files[href] != null ? '<style>' + files[href] + '</style>' : '');
      const key = page + '\u0000' + src;
      if (key !== this.lastPage) {
        this.lastPage = key;
        let css = '';
        let html = src.replace(/<style[^>]*>([\s\S]*?)(<\/style>|$)/gi, (m, c) => { css += c + '\n'; return ''; });
        const title = (/<title>([\s\S]*?)(<\/title>|$)/i.exec(html) || [])[1] || '';
        html = html.replace(/<!--[\s\S]*?(-->|$)/g, '').replace(/<title>[\s\S]*?(<\/title>|$)/gi, '').replace(/<script[\s\S]*?(<\/script>|$)/gi, '')
          .replace(/<!doctype[^>]*>|<\/?(html|head|body)(\s[^>]*)?>|<(meta|link)\b[^>]*>/gi, '');
        const A = window.VIDEO_ASSETS || {};
        html = html.replace(/(src=["'])([^"']+)(["'])/g, (m, a, u, b) => a + (A[u.replace(/^\.\//, '')] || u) + b);
        css = transformCSS(css).replace(/url\((["']?)([^)"']+)\1\)/g, (m, q, u) => 'url(' + q + (A[u] || u) + q + ')');
        this.root.innerHTML = '<style>' + BASE + '</style><style>' + css + '</style><div class="vp"><div class="page">' + html + '</div></div>';
        this.vpEl = this.root.querySelector('.vp');
        this.seenAnims = new Map();
        this.addrTitle.textContent = title;
        this.addrUrl.textContent = 'my-site/' + page;
        this.root.querySelectorAll('img').forEach(img => { if (!img.complete) this.V.pending.push(img.decode().catch(() => {})); });
      }
      // size of the "screen" and zoom
      const vw = this.vwAt(t);
      const inner = { w: this.brBox.w - 4, h: this.brBox.h - 74 };
      const width = vw == null ? this.fitWidth() : vw;
      const zoom = this.o.fixedZoom || Math.min(inner.w / width, this.o.maxZoom || 1.25);
      this.zoom = zoom;
      this.host.style.width = width + 'px';
      this.host.style.height = (inner.h / zoom) + 'px';
      this.host.style.left = Math.max(0, (inner.w - width * zoom) / 2) + 'px';
      this.host.style.transform = 'scale(' + zoom + ')';
      if (this.readEl) this.readEl.textContent = Math.round(width) + 'px wide';
      // hover states
      this.root.querySelectorAll('.is-hover, .is-focus, .is-active').forEach(x => x.classList.remove('is-hover', 'is-focus', 'is-active'));
      for (const h of this.hovers) if (t >= h.t0 && t < h.t1) this.root.querySelectorAll(h.sel).forEach(x => x.classList.add(h.cls));
      // CSS transitions and animations follow the video clock
      if (this.vpEl) {
        for (const an of this.vpEl.getAnimations({ subtree: true })) {
          if (!this.seenAnims.has(an)) { this.seenAnims.set(an, t); an.pause(); }
          an.currentTime = Math.max(0, (t - this.seenAnims.get(an)) * 1000);
        }
        let y = 0;
        for (const k of this.scrollKeys) { if (t < k.t0) break; const from = y; y = t >= k.t1 ? k.y : lerp(from, k.y, ease.inOut((t - k.t0) / (k.t1 - k.t0))); }
        this.vpEl.scrollTop = y;
      }
    }

    /* ----- positions on screen (stage pixels) ----- */
    stageBox() {
      const r = this.V.stage.getBoundingClientRect();
      return { x: r.left, y: r.top, s: r.width / W };
    }
    siteRect(sel, i) {
      if (!this.root) return null;
      const list = this.root.querySelectorAll(sel);
      const e = list[i || 0];
      if (!e) return null;
      const r = e.getBoundingClientRect(), sb = this.stageBox();
      return { x: (r.left - sb.x) / sb.s, y: (r.top - sb.y) / sb.s, w: r.width / sb.s, h: r.height / sb.s, el: e };
    }
    codeRect(str, occ) {
      if (!this.edBox || !this.state) return null;
      const code = this.state.s.files[this.state.s.active];
      let i = -1;
      for (let k = 0; k <= (occ || 0); k++) { i = code.indexOf(str, i + 1); if (i < 0) return null; }
      const a = this.lineCol(code, i);
      const first = str.split('\n')[0];
      const x0 = this.V.measure(a.lineText, this.FONT);
      const w = this.V.measure(first, this.FONT);
      const y = this.edBox.y + 2 + 70 + 22 + a.line * this.LH - (this.scrollTop || 0);
      if (y < this.edBox.y + 60 || y > this.edBox.y + this.edBox.h - 30) return null;
      const off = this.edP ? this.panelOffset(this.edP) : { x: 0, y: 0 };
      return { x: this.edBox.x + 2 + 86 + x0 + off.x, y: y + off.y, w, h: this.LH };
    }
    panelOffset(p) {
      // panels slide in: follow their animation
      const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(p.style.transform || '');
      return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 };
    }

    /* ----- overlays: callouts, boxes, rulers, cursor ----- */
    // target: {code: 'text', occ} or {site: 'selector', i} ; side: 'top' | 'bottom' | 'left' | 'right'
    callout(target, text, o) {
      o = o || {};
      const V = this.V;
      const t0 = V.t + (o.delay || 0), t1 = o.until != null ? o.until : t0 + (o.dur || Math.max(3, readTime(o.say || text)));
      const box = el('div', 'hl-box' + (target.site ? ' site' : ''), null, this.ov);
      const pill = el('div', 'pill', rich(text), this.ov);
      if (o.color) { box.style.setProperty('--cc', o.color); pill.style.setProperty('--cc', o.color); }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none'); path.setAttribute('stroke-width', '4'); path.setAttribute('stroke-linecap', 'round');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '7');
      this.svg.appendChild(path); this.svg.appendChild(dot);
      this.overlays.push({ kind: 'callout', target, side: o.side || 'top', t0, t1, box, pill, path, dot, color: o.color, dist: o.dist || 70, dx: o.dx || 0 });
      V.sfx(t0, 'pop');
      if (o.say) V.caption(o.say, t0, Math.max(t1, t0 + readTime(o.say)));
      if (o.wait !== false) V.t = Math.max(t1, o.say ? t0 + readTime(o.say) : t0) + (o.pause == null ? 0.2 : o.pause);
      return t0;
    }
    box(sel, o) {
      o = o || {};
      const V = this.V;
      const t0 = V.t + (o.delay || 0), t1 = t0 + (o.dur || 7);
      const layers = ['margin', 'border', 'padding', 'content'].map(k => {
        const d = el('div', 'bm', null, this.ov);
        const lab = el('div', 'bm-label', k, this.ov);
        return { k, d, lab };
      });
      this.overlays.push({ kind: 'box', sel, i: o.i || 0, t0, t1, layers, step: o.step || 1.1 });
      for (let k = 0; k < 4; k++) V.sfx(t0 + k * (o.step || 1.1), 'pop');
      if (o.say) V.caption(o.say, t0, Math.max(t1, t0 + readTime(o.say)));
      if (o.wait !== false) V.t = t1 + 0.2;
      return t0;
    }
    ruler(sel, o) {
      o = o || {};
      const V = this.V;
      const t0 = V.t + (o.delay || 0), t1 = o.until != null ? o.until : t0 + (o.dur || 4);
      const line = el('div', 'ruler-line', null, this.ov);
      const pill = el('div', 'pill', '', this.ov);
      if (o.color) { line.style.setProperty('--cc', o.color); pill.style.setProperty('--cc', o.color); }
      this.overlays.push({ kind: 'ruler', sel, i: o.i || 0, t0, t1, line, pill, axis: o.axis || 'x', label: o.label });
      V.sfx(t0, 'pop');
      if (o.say) V.caption(o.say, t0, Math.max(t1, t0 + readTime(o.say)));
      if (o.wait !== false) V.t = t1 + 0.2;
      return t0;
    }
    // a mouse pointer that glides to an element
    cursorTo(sel, t0, d, t1, o) {
      o = o || {};
      if (!this.cursorEl) {
        this.cursorEl = el('div', 'cursor', '<svg viewBox="0 0 24 24" width="46" height="46"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.6 20.3 L11.7 13.7 L18 13.4 Z" fill="#1B1930" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>', this.ov);
        this.cursorKeys = [];
      }
      this.cursorKeys.push({ sel, t0, t1: t0 + d, end: t1, click: o.click });
      if (o.click) this.V.sfx(t0 + d + 0.05, 'click');
    }
    click(sel, o) {
      o = o || {};
      const t = this.V.t;
      this.cursorTo(sel, t, 0.7, t + (o.hold || 1.6), { click: true });
      this.hovers.push({ sel, t0: t + 0.7, t1: t + (o.hold || 1.6), cls: 'is-hover' });
      this.hovers.push({ sel, t0: t + 0.72, t1: t + 0.95, cls: 'is-active' });
      if (o.wait !== false) this.V.t += (o.hold || 1.6) + 0.2;
    }
    renderOverlays(t) {
      if (this.shot.end != null && t >= this.shot.end) return;
      for (const ov of this.overlays) {
        if (ov.kind === 'callout') this.drawCallout(ov, t);
        else if (ov.kind === 'box') this.drawBox(ov, t);
        else if (ov.kind === 'ruler') this.drawRuler(ov, t);
      }
      if (this.cursorEl) this.drawCursor(t);
    }
    targetRect(target) {
      if (target.node) {
        const n = typeof target.node === 'function' ? target.node() : target.node;
        if (!n || !n.isConnected) return null;
        const r = n.getBoundingClientRect(), sb = this.stageBox();
        return { x: (r.left - sb.x) / sb.s, y: (r.top - sb.y) / sb.s, w: r.width / sb.s, h: r.height / sb.s };
      }
      if (target.code != null) return this.codeRect(target.code, target.occ);
      if (target.site != null) return this.siteRect(target.site, target.i);
      return target.rect || null;
    }
    drawCallout(c, t) {
      const on = t >= c.t0 && t < c.t1;
      const r = on ? this.targetRect(c.target) : null;
      if (!r) { c.box.style.display = c.pill.style.display = 'none'; c.path.style.display = c.dot.style.display = 'none'; return; }
      const p = ease.back(clamp((t - c.t0) / 0.45, 0, 1)), q = clamp((c.t1 - t) / 0.25, 0, 1);
      const o = Math.min(clamp((t - c.t0) / 0.2, 0, 1), q);
      const pad = c.target.code != null ? 4 : 2;
      Object.assign(c.box.style, { display: '', left: (r.x - pad) + 'px', top: (r.y - pad) + 'px', width: (r.w + pad * 2) + 'px', height: (r.h + pad * 2) + 'px', opacity: o });
      c.pill.style.display = '';
      const pw = c.pill.offsetWidth, ph = c.pill.offsetHeight;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      let px, py, ax, ay;
      const d = c.dist;
      // flip a label that would leave the work area
      if (c.side === 'top' && r.y - d - ph < 120) c.side = 'bottom';
      else if (c.side === 'bottom' && r.y + r.h + d + ph > 880) c.side = 'top';
      if (c.side === 'top') { px = cx - pw / 2 + c.dx; py = r.y - d - ph; ax = cx; ay = r.y - pad; }
      else if (c.side === 'bottom') { px = cx - pw / 2 + c.dx; py = r.y + r.h + d; ax = cx; ay = r.y + r.h + pad; }
      else if (c.side === 'left') { px = r.x - d - pw; py = cy - ph / 2; ax = r.x - pad; ay = cy; }
      else { px = r.x + r.w + d; py = cy - ph / 2; ax = r.x + r.w + pad; ay = cy; }
      px = clamp(px, 20, W - pw - 20); py = clamp(py, 20, H - ph - 20);
      Object.assign(c.pill.style, { left: px + 'px', top: py + 'px', opacity: o, transform: 'scale(' + (0.6 + 0.4 * p).toFixed(3) + ')' });
      // the arrow from the label to the target
      const sx = clamp(ax, px + 20, px + pw - 20), sy = c.side === 'top' ? py + ph : c.side === 'bottom' ? py : py + ph / 2;
      const sx2 = c.side === 'left' ? px + pw : c.side === 'right' ? px : sx;
      const color = c.color || getComputedStyle(this.V.stage).getPropertyValue('--g').trim() || '#CC2D67';
      const mx = (sx2 + ax) / 2, my = (sy + ay) / 2;
      c.path.setAttribute('d', 'M' + sx2 + ',' + sy + ' Q' + (c.side === 'left' || c.side === 'right' ? mx + ',' + sy : sx2 + ',' + my) + ' ' + ax + ',' + ay);
      c.path.setAttribute('stroke', color);
      c.path.style.display = ''; c.path.style.opacity = o;
      c.dot.setAttribute('cx', ax); c.dot.setAttribute('cy', ay); c.dot.setAttribute('fill', color);
      c.dot.style.display = ''; c.dot.style.opacity = o;
    }
    drawBox(b, t) {
      const on = t >= b.t0 && t < b.t1;
      const r = on ? this.siteRect(b.sel, b.i) : null;
      if (!r) { b.layers.forEach(l => { l.d.style.display = l.lab.style.display = 'none'; }); return; }
      const cs = getComputedStyle(r.el), z = this.zoom;
      const px = k => parseFloat(cs[k]) * z || 0;
      const m = [px('marginTop'), px('marginRight'), px('marginBottom'), px('marginLeft')];
      const bo = [px('borderTopWidth'), px('borderRightWidth'), px('borderBottomWidth'), px('borderLeftWidth')];
      const pa = [px('paddingTop'), px('paddingRight'), px('paddingBottom'), px('paddingLeft')];
      const rects = {
        margin: { x: r.x - m[3], y: r.y - m[0], w: r.w + m[1] + m[3], h: r.h + m[0] + m[2] },
        border: { x: r.x, y: r.y, w: r.w, h: r.h },
        padding: { x: r.x + bo[3], y: r.y + bo[0], w: r.w - bo[1] - bo[3], h: r.h - bo[0] - bo[2] },
        content: { x: r.x + bo[3] + pa[3], y: r.y + bo[0] + pa[0], w: r.w - bo[1] - bo[3] - pa[1] - pa[3], h: r.h - bo[0] - bo[2] - pa[0] - pa[2] }
      };
      const colors = { margin: 'rgba(246,178,107,.55)', border: 'rgba(255,214,102,.75)', padding: 'rgba(147,196,125,.6)', content: 'rgba(111,168,220,.55)' };
      const order = ['content', 'padding', 'border', 'margin'];
      b.layers.forEach(l => {
        const k = order.indexOf(l.k);
        const ts = b.t0 + k * b.step;
        const o = Math.min(clamp((t - ts) / 0.35, 0, 1), clamp((b.t1 - t) / 0.3, 0, 1));
        const R = rects[l.k];
        if (t < ts) { l.d.style.display = l.lab.style.display = 'none'; return; }
        Object.assign(l.d.style, { display: '', left: R.x + 'px', top: R.y + 'px', width: Math.max(0, R.w) + 'px', height: Math.max(0, R.h) + 'px', background: colors[l.k], opacity: o, zIndex: 4 - k });
        // a frame of color: cut out the inner box
        if (l.k !== 'content') {
          const inner = rects[order[k - 1]];
          const ix = inner.x - R.x, iy = inner.y - R.y;
          l.d.style.clipPath = 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ' + ix + 'px ' + iy + 'px, ' + ix + 'px ' + (iy + inner.h) + 'px, ' + (ix + inner.w) + 'px ' + (iy + inner.h) + 'px, ' + (ix + inner.w) + 'px ' + iy + 'px, ' + ix + 'px ' + iy + 'px)';
        }
        const sizes = { margin: m, border: bo, padding: pa };
        const lab = l.k === 'content' ? 'content ' + Math.round(R.w / z) + ' × ' + Math.round(R.h / z) : l.k + ' ' + Math.round(sizes[l.k][0] / z) + 'px';
        l.lab.textContent = lab;
        l.lab.style.display = '';
        const lw = l.lab.offsetWidth;
        // each label in its own corner, so they never cover each other
        const pos = l.k === 'margin' ? { x: R.x + 8, y: R.y + 4 }
          : l.k === 'border' ? { x: R.x + R.w - lw - 6, y: R.y - 26 }
          : l.k === 'padding' ? { x: R.x + 8, y: R.y + R.h - 26 }
          : { x: R.x + R.w / 2 - lw / 2, y: R.y + R.h / 2 - 12 };
        Object.assign(l.lab.style, { left: pos.x + 'px', top: pos.y + 'px', opacity: o, zIndex: 10 });
      });
    }
    drawRuler(rl, t) {
      const on = t >= rl.t0 && t < rl.t1;
      const r = on ? this.siteRect(rl.sel, rl.i) : null;
      if (!r) { rl.line.style.display = rl.pill.style.display = 'none'; return; }
      const p = ease.out(clamp((t - rl.t0) / 0.6, 0, 1)), o = Math.min(clamp((t - rl.t0) / 0.2, 0, 1), clamp((rl.t1 - t) / 0.25, 0, 1));
      const z = this.zoom;
      const below = r.y - 100 < this.brBox.y + 80;
      const y = below ? r.y + r.h + 22 : r.y - 22;
      Object.assign(rl.line.style, { display: '', left: r.x + 'px', top: y + 'px', width: (r.w * p) + 'px', opacity: o });
      rl.pill.textContent = rl.label || (Math.round(r.w / z) + 'px');
      rl.pill.style.display = '';
      const pw = rl.pill.offsetWidth;
      Object.assign(rl.pill.style, { left: clamp(r.x + r.w / 2 - pw / 2, 20, W - pw - 20) + 'px', top: (below ? y + 22 : y - 70) + 'px', opacity: o });
    }
    drawCursor(t) {
      let pos = null, vis = false, click = null;
      let prev = null;
      for (const k of this.cursorKeys) {
        if (t < k.t0) break;
        const r = this.siteRect(k.sel);
        const target = r ? { x: r.x + r.w * 0.6, y: r.y + r.h * 0.6 } : null;
        if (!target) continue;
        const from = prev || { x: target.x + 160, y: target.y + 140 };
        const p = ease.inOut(clamp((t - k.t0) / (k.t1 - k.t0), 0, 1));
        pos = { x: lerp(from.x, target.x, p), y: lerp(from.y, target.y, p) };
        vis = t < k.end + 0.4;
        if (k.click && t >= k.t1 && t < k.t1 + 0.5) click = { x: target.x, y: target.y, p: (t - k.t1) / 0.5 };
        prev = target;
      }
      if (!pos || !vis) { this.cursorEl.style.display = 'none'; if (this.rip) this.rip.style.display = 'none'; return; }
      Object.assign(this.cursorEl.style, { display: '', left: pos.x + 'px', top: pos.y + 'px' });
      if (click) {
        if (!this.rip) this.rip = el('div', 'ripple', null, this.ov);
        Object.assign(this.rip.style, { display: '', left: click.x + 'px', top: click.y + 'px', transform: 'scale(' + (0.4 + click.p).toFixed(2) + ')', opacity: (1 - click.p).toFixed(2) });
      } else if (this.rip) this.rip.style.display = 'none';
    }
  }

  window.HelloVideo = { Video, Lesson, Bench, ease, el, esc, rich, readTime, W, H };
})();
