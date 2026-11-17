/* ============================================================
   Hello HTML: the course engine.
   It turns simple markup in the lesson pages into:
   - playgrounds  (edit code, see the website update live)
   - explorers    (move sliders, watch code + website change)
   - quizzes, code snippets, the lesson menu and your progress
   You don't need to understand this file to take the course!
   ============================================================ */
(function () {
  'use strict';

  var LESSONS = [
    { id: '00-start-here', title: 'Start Here', chip: 'hello', group: 'basics', blurb: 'What a website really is, how this course works, and how to make your first file.' },
    { id: '01-first-page', title: 'Your First Web Page', chip: '<html>', group: 'basics', blurb: 'Tags, elements and the skeleton every page needs.' },
    { id: '02-text', title: 'Headings, Paragraphs & Lists', chip: '<h1>', group: 'basics', blurb: 'Write titles, paragraphs, bold words and lists.' },
    { id: '03-links-images', title: 'Links & Images', chip: '<a>', group: 'basics', blurb: 'Connect pages together and show pictures.' },
    { id: '04-colors', title: 'Hello CSS: Colors', chip: 'color:', group: 'style', blurb: 'Meet CSS and paint text and backgrounds in any color.' },
    { id: '05-classes', title: 'Classes, Divs & Sections', chip: '.class', group: 'style', blurb: 'Group things into boxes and style exactly the parts you want.' },
    { id: '06-fonts', title: 'Fonts & Text Style', chip: 'font', group: 'style', blurb: 'Pick fonts, sizes, weights and spacing for your text.' },
    { id: '07-sizes', title: 'Sizes & Units', chip: 'px', group: 'style', blurb: 'px, %, rem and vw: what every size means, with a size guide.' },
    { id: '08-box-model', title: 'Spacing: The Box Model', chip: 'padding', group: 'style', blurb: 'Padding, borders, margins, rounded corners and shadows.' },
    { id: '09-buttons', title: 'Buttons', chip: '<button>', group: 'parts', blurb: 'Make buttons that look great and react when touched.' },
    { id: '10-forms', title: 'Text Boxes & Forms', chip: '<input>', group: 'parts', blurb: 'Text boxes, checkboxes, dropdowns and a full sign-up form.' },
    { id: '11-flexbox', title: 'Layout with Flexbox', chip: 'flex', group: 'layout', blurb: 'Put things side by side, centered and spaced out.' },
    { id: '12-grid', title: 'Layout with Grid', chip: 'grid', group: 'layout', blurb: 'Rows and columns for cards and photo galleries.' },
    { id: '13-pages', title: 'Multiple Pages', chip: 'href', group: 'layout', blurb: 'Build a real website with several pages and a menu.' },
    { id: '14-beautiful', title: 'Make It Beautiful', chip: 'shadow', group: 'polish', blurb: 'Gradients, soft shadows, hover effects and animation.' },
    { id: '15-responsive', title: 'Phones & Tablets', chip: '@media', group: 'polish', blurb: 'Make your site look good on every screen size.' },
    { id: '16-final-project', title: 'Final Project', chip: 'launch', group: 'build', blurb: 'Build a complete, polished website from start to finish.' }
  ];
  var GROUPS = {
    basics: { name: 'HTML basics', color: '--c-tag' },
    style: { name: 'Styling with CSS', color: '--c-prop' },
    parts: { name: 'Building blocks', color: '--c-attr' },
    layout: { name: 'Layout & pages', color: '--c-val' },
    polish: { name: 'Polish', color: '--c-sel' },
    build: { name: 'Build', color: '--ink' }
  };

  var body = document.body;
  var ROOT = body.getAttribute('data-root') || '.';
  var CURRENT = body.getAttribute('data-lesson') || '';
  var current = LESSONS.filter(function (l) { return l.id === CURRENT; })[0];
  if (current) body.setAttribute('data-group', current.group);

  function lessonHref(id) { return ROOT + '/lessons/' + id + '.html'; }
  function homeHref() { return ROOT + '/index.html'; }

  /* ---------- Progress (saved only in this browser) ---------- */
  var KEY = 'hello-html:done';
  function getDone() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; }
  }
  function setDone(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage blocked: progress just isn't saved */ }
  }
  function isDone(id) { return getDone().indexOf(id) >= 0; }
  function toggleDone(id) {
    var list = getDone();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    setDone(list);
    refreshProgress();
    return i < 0;
  }

  /* ---------- Small helpers ---------- */
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function dedent(text) {
    var lines = text.replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    var min = Infinity;
    lines.forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
    if (!isFinite(min)) min = 0;
    return lines.map(function (l) { return l.slice(min); }).join('\n');
  }
  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = ok ? 'Copied' : 'Select + copy';
      setTimeout(function () { btn.textContent = old; }, 1400);
    }
    try {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } catch (e) { done(false); }
  }
  var uid = 0;

  /* ============================================================
     Syntax highlighting (HTML with CSS inside, and CSS files)
     ============================================================ */
  var NAMES = 'aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen';
  var COLOR_RE = new RegExp('#[0-9a-fA-F]{3,8}\\b|\\b(?:rgba?|hsla?)\\([^()]*\\)|\\b(?:' + NAMES + ')\\b', 'g');

  function sp(cls, s) { return s ? '<span class="t-' + cls + '">' + esc(s) + '</span>' : ''; }

  function hlValue(v) {
    var out = '', last = 0, m;
    COLOR_RE.lastIndex = 0;
    while ((m = COLOR_RE.exec(v))) {
      out += sp('val', v.slice(last, m.index));
      out += '<span class="t-val t-color" style="--sw:' + m[0].replace(/[^#\w(),.%\s\/-]/g, '') + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    return out + sp('val', v.slice(last));
  }

  function hlCSS(src, startInDecls) {
    var out = '', i = 0, n = src.length;
    var stack = [startInDecls ? 'decls' : 'rules'];
    var j, k;
    while (i < n) {
      var ctx = stack[stack.length - 1];
      var c = src[i];
      if (src.substr(i, 2) === '/*') {
        var e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2;
        out += sp('com', src.slice(i, e)); i = e; continue;
      }
      if (c === '}') {
        out += sp('punc', '}'); stack.pop(); if (!stack.length) stack.push('rules'); i++; continue;
      }
      if (/\s/.test(c)) {
        j = i; while (j < n && /\s/.test(src[j])) j++;
        out += esc(src.slice(i, j)); i = j; continue;
      }
      if (ctx === 'rules') {
        j = i;
        while (j < n && src[j] !== '{' && src[j] !== '}' && src[j] !== ';' && src.substr(j, 2) !== '/*') j++;
        var sel = src.slice(i, j);
        var trimmed = sel.trim();
        if (trimmed.charAt(0) === '@') {
          var mm = sel.match(/^(@[\w-]+)([\s\S]*)$/);
          out += mm ? sp('at', mm[1]) + hlValue(mm[2]) : sp('at', sel);
        } else {
          out += sp('sel', sel);
        }
        i = j;
        if (src[j] === '{') {
          out += sp('punc', '{'); i++;
          stack.push(/^@(media|supports|container|layer|keyframes|-webkit-keyframes)/i.test(trimmed) ? 'rules' : 'decls');
        } else if (src[j] === ';') { out += sp('punc', ';'); i++; }
        if (i === j && j < n && src[j] !== '}' && src.substr(j, 2) !== '/*') { out += esc(src[j]); i++; }
        continue;
      }
      // inside { ... } : property: value;
      if (c === ';') { out += sp('punc', ';'); i++; continue; }
      j = i;
      while (j < n && ':;{}\n'.indexOf(src[j]) < 0 && src.substr(j, 2) !== '/*') j++;
      if (src[j] === ':') {
        out += sp('prop', src.slice(i, j)) + sp('punc', ':');
        i = j + 1;
        k = i; var depth = 0;
        while (k < n) {
          var ch = src[k];
          if (ch === '(') depth++;
          else if (ch === ')') depth--;
          else if ((ch === ';' || ch === '}') && depth <= 0) break;
          else if (src.substr(k, 2) === '/*') break;
          k++;
        }
        out += hlValue(src.slice(i, k)); i = k; continue;
      }
      if (src[j] === '{') {
        out += sp('sel', src.slice(i, j)) + sp('punc', '{'); stack.push('decls'); i = j + 1; continue;
      }
      if (j === i) { out += esc(src[i]); i++; continue; }
      out += sp('prop', src.slice(i, j)); i = j;
    }
    return out;
  }

  function hlText(t) {
    return esc(t).replace(/&amp;(#?\w+);/g, '<span class="t-ent">&amp;$1;</span>');
  }

  function hlHTML(src) {
    var out = '', i = 0, n = src.length, j, k, e;
    while (i < n) {
      if (src.substr(i, 4) === '<!--') {
        e = src.indexOf('-->', i + 4); e = e < 0 ? n : e + 3;
        out += sp('com', src.slice(i, e)); i = e; continue;
      }
      if (src[i] === '<' && /[a-zA-Z\/!]/.test(src[i + 1] || '')) {
        j = i + 1;
        var closing = false;
        if (src[j] === '!') {
          e = src.indexOf('>', j); e = e < 0 ? n : e + 1;
          out += sp('doc', src.slice(i, e)); i = e; continue;
        }
        if (src[j] === '/') { closing = true; j++; }
        k = j; while (k < n && /[a-zA-Z0-9-]/.test(src[k])) k++;
        var name = src.slice(j, k);
        out += sp('punc', closing ? '</' : '<') + sp('tag', name);
        i = k;
        while (i < n && src[i] !== '>') {
          var c = src[i];
          if (c === '<') break;
          if (/\s/.test(c)) { out += esc(c); i++; continue; }
          if (c === '/') { out += sp('punc', '/'); i++; continue; }
          var a = i; while (a < n && !/[\s=>\/<]/.test(src[a])) a++;
          var an = src.slice(i, a);
          out += sp('attr', an); i = a;
          if (src[i] === '=') {
            out += sp('punc', '='); i++;
            var q = src[i];
            if (q === '"' || q === "'") {
              e = src.indexOf(q, i + 1);
              var closed = e >= 0; if (!closed) e = n;
              var inner = src.slice(i + 1, e);
              out += sp('str', q) + (an.toLowerCase() === 'style' ? hlCSS(inner, true) : sp('str', inner)) + (closed ? sp('str', q) : '');
              i = closed ? e + 1 : n;
            } else {
              var u = i; while (u < n && !/[\s>]/.test(src[u])) u++;
              out += sp('str', src.slice(i, u)); i = u;
            }
          } else if (an === '') { out += esc(src[i]); i++; }
        }
        if (src[i] === '>') { out += sp('punc', '>'); i++; }
        var lname = name.toLowerCase();
        if (!closing && (lname === 'style' || lname === 'script')) {
          var rest = src.slice(i);
          var at = rest.search(new RegExp('</' + lname, 'i'));
          e = at < 0 ? n : i + at;
          var body2 = src.slice(i, e);
          out += lname === 'style' ? hlCSS(body2) : sp('js', body2);
          i = e;
        }
        continue;
      }
      j = src.indexOf('<', i + 1); if (j < 0) j = n;
      out += hlText(src.slice(i, j)); i = j;
    }
    return out;
  }

  function highlight(code, lang) { return lang === 'css' ? hlCSS(code) : hlHTML(code); }
  function langOf(name) { return /\.css$/i.test(name || '') ? 'css' : 'html'; }

  /* ============================================================
     Live preview (a pretend browser window)
     ============================================================ */
  function Preview(opts) {
    var self = this;
    this.scale = 1;
    this.device = 0;
    this.xray = false;
    this.fixedHeight = opts.height || 0;
    this.onNavigate = opts.onNavigate || null;
    this.files = opts.files || null;

    var view = el('div', { class: 'pg-view' + (opts.devices ? ' devices' : '') });
    var bar = el('div', { class: 'pg-bar browser-bar' });
    bar.appendChild(el('span', { class: 'dots', 'aria-hidden': 'true' }, '<i></i><i></i><i></i>'));
    var addr = el('div', { class: 'address' }, '<span class="page-title"></span><span class="url"></span>');
    bar.appendChild(addr);
    var xbtn = el('button', { class: 'mini-btn', type: 'button', 'aria-pressed': 'false', title: 'Show the box around every element and its size' }, 'X-ray');
    bar.appendChild(xbtn);
    view.appendChild(bar);

    var wrap = el('div', { class: 'frame-wrap' });
    var frame = el('iframe', { title: 'Live website preview', loading: 'eager' });
    wrap.appendChild(frame);
    var toast = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite', hidden: '' });
    wrap.appendChild(toast);
    var xbox = el('div', { class: 'xray-box', hidden: '' });
    var xlabel = el('div', { class: 'xray-label', hidden: '' });
    wrap.appendChild(xbox); wrap.appendChild(xlabel);
    view.appendChild(wrap);

    if (opts.devices) {
      var dbar = el('div', { class: 'device-bar' });
      dbar.appendChild(el('span', null, 'Screen:'));
      [['Phone', 375], ['Tablet', 768], ['Laptop', 1280], ['Fit', 0]].forEach(function (d) {
        var b = el('button', { class: 'mini-btn', type: 'button', 'aria-pressed': d[1] === 0 ? 'true' : 'false' }, d[0] + (d[1] ? ' ' + d[1] : ''));
        b.addEventListener('click', function () {
          dbar.querySelectorAll('.mini-btn').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          self.device = d[1];
          self.layout();
        });
        dbar.appendChild(b);
      });
      this.readout = el('span', { class: 'readout' });
      dbar.appendChild(this.readout);
      view.appendChild(dbar);
    }

    this.view = view; this.wrap = wrap; this.frame = frame; this.toastEl = toast;
    this.addr = addr; this.xbox = xbox; this.xlabel = xlabel;

    xbtn.addEventListener('click', function () {
      self.xray = !self.xray;
      xbtn.setAttribute('aria-pressed', String(self.xray));
      self.applyXray();
      if (self.xray) self.toast('X-ray is on. Point at (or tap) anything on the website to see its tag and its size in pixels.');
    });

    if (window.ResizeObserver) {
      new ResizeObserver(function () { self.layout(); }).observe(wrap);
    }
  }

  Preview.prototype.doc = function () {
    try { return this.frame.contentDocument; } catch (e) { return null; }
  };

  Preview.prototype.write = function (html, pageName) {
    var self = this;
    var doc = this.doc();
    if (!doc) return;
    var y = 0;
    try { y = doc.scrollingElement ? doc.scrollingElement.scrollTop : 0; } catch (e) { y = 0; }
    if (!/^\s*<!doctype/i.test(html)) html = '<!DOCTYPE html>\n' + html;
    doc.open();
    doc.write(html);
    doc.close();
    doc = this.doc();
    if (!doc) return;
    if (doc.scrollingElement) doc.scrollingElement.scrollTop = y;
    this.page = pageName || this.page || 'index.html';
    this.addr.querySelector('.url').textContent = 'my-site/' + this.page;
    this.addr.querySelector('.page-title').textContent = doc.title || '';
    doc.addEventListener('click', function (e) { self.onClick(e); }, true);
    doc.addEventListener('submit', function (e) { self.onSubmit(e); }, true);
    doc.addEventListener('mousemove', function (e) { self.onHover(e); });
    doc.addEventListener('mouseleave', function () { self.hideX(); });
    doc.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', function () { self.fit(); }); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { self.fit(); });
    setTimeout(function () { self.fit(); }, 350);
    this.applyXray();
    this.fit();
  };

  Preview.prototype.fit = function () {
    var doc = this.doc();
    if (!doc || !doc.documentElement) return;
    var h = this.fixedHeight;
    if (!h) {
      h = doc.documentElement.offsetHeight || 0;
      h = Math.max(150, Math.min(h + 2, 620));
    }
    this.contentH = h;
    this.layout();
  };

  Preview.prototype.layout = function () {
    var f = this.frame, wrap = this.wrap;
    var h = this.contentH || 200;
    var W = wrap.clientWidth || 600;
    if (this.device) {
      var s = Math.min(1, W / this.device);
      this.scale = s;
      wrap.style.minHeight = Math.round(h * s) + 'px';
      var wrapH = Math.max(wrap.clientHeight, h * s);
      f.style.width = this.device + 'px';
      f.style.height = Math.round(wrapH / s) + 'px';
      f.style.left = Math.max(0, (W - this.device * s) / 2) + 'px';
      f.style.transform = 'scale(' + s + ')';
    } else {
      this.scale = 1;
      wrap.style.minHeight = h + 'px';
      f.style.width = '100%';
      f.style.height = '100%';
      f.style.left = '0';
      f.style.transform = '';
    }
    if (this.readout) {
      var w = this.device || W;
      this.readout.textContent = 'website width: ' + Math.round(w) + 'px' + (this.scale < 1 ? ' (shrunk to fit)' : '');
    }
  };

  Preview.prototype.toast = function (html) {
    var t = this.toastEl;
    t.innerHTML = html;
    t.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () { t.hidden = true; }, 5200);
  };

  Preview.prototype.onClick = function (e) {
    var target = e.target;
    var a = target && target.closest ? target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var doc = this.doc();
    if (href.charAt(0) === '#') {
      e.preventDefault();
      var id = decodeURIComponent(href.slice(1));
      var t = id ? doc.getElementById(id) : null;
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (doc.scrollingElement) doc.scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    var clean = href.replace(/^\.\//, '').split('#')[0];
    var hash = href.split('#')[1] || '';
    if (this.files && this.onNavigate && this.files.some(function (f) { return f.name === clean && langOf(f.name) === 'html'; })) {
      e.preventDefault();
      this.onNavigate(clean);
      var d2 = this.doc();
      var target = hash && d2 ? d2.getElementById(decodeURIComponent(hash)) : null;
      if (target) target.scrollIntoView({ block: 'start' });
      return;
    }
    e.preventDefault();
    var kind = /^mailto:/i.test(href) ? 'an email link. It would open an email app to write to '
      : /^tel:/i.test(href) ? 'a phone link. On a phone it would call '
      : 'a link. On a real website it would open ';
    this.toast('You clicked ' + kind + '<b>' + esc(href.replace(/^(mailto|tel):/i, '')) + '</b>' + (a.getAttribute('target') === '_blank' ? ' in a new tab' : '') + '. Links are paused here so you stay in the lesson.');
  };

  Preview.prototype.onSubmit = function (e) {
    e.preventDefault();
    var form = e.target;
    var parts = [];
    try {
      new FormData(form).forEach(function (v, k) {
        if (typeof v !== 'string') v = v && v.name ? v.name : '(file)';
        parts.push('<b>' + esc(k) + '</b> = ' + esc(v || '(empty)'));
      });
    } catch (err) { /* ignore */ }
    this.toast(parts.length
      ? 'Form sent! The website received: ' + parts.join(' &middot; ')
      : 'Form sent, but nothing was received. Each box needs a <b>name</b> attribute to send its data.');
  };

  Preview.prototype.applyXray = function () {
    var doc = this.doc();
    if (!doc) return;
    var s = doc.getElementById('__xray');
    if (this.xray && !s) {
      s = doc.createElement('style');
      s.id = '__xray';
      s.textContent = 'body *{outline:1px dashed rgba(204,45,103,.6)!important;outline-offset:-1px!important}';
      (doc.head || doc.documentElement).appendChild(s);
    } else if (!this.xray && s) {
      s.parentNode.removeChild(s);
    }
    if (!this.xray) this.hideX();
  };

  Preview.prototype.hideX = function () { this.xbox.hidden = true; this.xlabel.hidden = true; };

  Preview.prototype.onHover = function (e) {
    if (!this.xray) return;
    var t = e.target;
    if (!t || t.nodeType !== 1 || t.tagName === 'HTML') { this.hideX(); return; }
    var r = t.getBoundingClientRect();
    var fr = this.frame.getBoundingClientRect();
    var wr = this.wrap.getBoundingClientRect();
    var s = this.scale;
    var x = fr.left - wr.left + r.left * s;
    var y = fr.top - wr.top + r.top * s;
    var b = this.xbox;
    b.style.left = x + 'px'; b.style.top = y + 'px';
    b.style.width = r.width * s + 'px'; b.style.height = r.height * s + 'px';
    b.hidden = false;
    var name = t.tagName.toLowerCase();
    var cls = (t.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
    if (t.id) name += '#' + t.id;
    if (cls.length) name += '.' + cls.join('.');
    var lab = this.xlabel;
    lab.textContent = '<' + name + '>  ' + Math.round(r.width) + ' × ' + Math.round(r.height) + ' px';
    lab.hidden = false;
    var ly = y - 24 < 2 ? y + r.height * s + 4 : y - 24;
    lab.style.top = Math.max(2, ly) + 'px';
    lab.style.left = Math.max(2, Math.min(x, wr.width - lab.offsetWidth - 4)) + 'px';
  };

  /* ============================================================
     Code editor (a textarea with colored code underneath)
     ============================================================ */
  function Editor(onChange) {
    var self = this;
    var root = el('div', { class: 'ed' });
    var gutter = el('div', { class: 'ed-gutter', 'aria-hidden': 'true' });
    var main = el('div', { class: 'ed-main' });
    var pre = el('pre', { class: 'ed-hl', 'aria-hidden': 'true' });
    var code = el('code');
    pre.appendChild(code);
    var id = 'code-' + (++uid);
    var ta = el('textarea', { class: 'ed-input', id: id, spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off', 'aria-label': 'Code editor. Type to change the website.' });
    main.appendChild(pre); main.appendChild(ta);
    root.appendChild(gutter); root.appendChild(main);
    root.addEventListener('click', function (e) { if (e.target === root || e.target === gutter) ta.focus(); });

    this.root = root; this.ta = ta; this.code = code; this.pre = pre; this.gutter = gutter;
    this.lang = 'html';
    this.escaped = false;

    ta.addEventListener('input', function () { self.render(); onChange && onChange(ta.value); });
    ta.addEventListener('scroll', function () { pre.scrollLeft = ta.scrollLeft; });
    ta.addEventListener('keydown', function (e) { self.keys(e); });
  }
  Editor.prototype.set = function (value, lang) {
    this.lang = lang || 'html';
    this.ta.value = value;
    this.render();
  };
  Editor.prototype.render = function () {
    var v = this.ta.value;
    this.code.innerHTML = highlight(v, this.lang) + (v.slice(-1) === '\n' ? ' ' : '') + '\n';
    var lines = v.split('\n').length;
    var g = '';
    for (var i = 1; i <= lines; i++) g += i + (i < lines ? '\n' : '');
    this.gutter.textContent = g;
    var ta = this.ta;
    var lh = parseFloat(getComputedStyle(ta).lineHeight) || 23;
    ta.style.height = Math.ceil(lines * lh + 28) + 'px';
    var extra = ta.offsetHeight - ta.clientHeight;
    if (extra > 0) ta.style.height = Math.ceil(lines * lh + 28 + extra) + 'px';
    this.pre.scrollLeft = ta.scrollLeft;
  };
  Editor.prototype.insert = function (text) {
    var ta = this.ta;
    ta.focus();
    var ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      var s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText(text, s, en, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  };
  Editor.prototype.keys = function (e) {
    var ta = this.ta;
    if (e.key === 'Escape') { this.escaped = true; return; }
    if (e.key === 'Tab' && !e.shiftKey && !this.escaped && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      this.insert('  ');
      return;
    }
    if (e.key !== 'Tab') this.escaped = false;
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.isComposing) {
      var s = ta.selectionStart;
      var before = ta.value.slice(0, s);
      var line = before.slice(before.lastIndexOf('\n') + 1);
      var indent = line.match(/^\s*/)[0];
      var prev = before.replace(/\s+$/, '').slice(-1);
      var after = ta.value.slice(s);
      var opensTag = /<([a-zA-Z][\w-]*)(\s[^<>]*)?>$/.test(before) && !/<(br|img|hr|input|meta|link|source|area|col|wbr)\b[^>]*>$/i.test(before);
      if (prev === '{' || opensTag) {
        e.preventDefault();
        if ((prev === '{' && /^\s*}/.test(after)) || (opensTag && /^<\//.test(after))) {
          this.insert('\n' + indent + '  \n' + indent);
          ta.selectionStart = ta.selectionEnd = s + 1 + indent.length + 2;
        } else {
          this.insert('\n' + indent + '  ');
        }
        return;
      }
      if (indent) { e.preventDefault(); this.insert('\n' + indent); }
    }
  };

  /* ============================================================
     Playground = editor + live preview
     ============================================================ */
  function makePlayground(host, files, opts) {
    opts = opts || {};
    var originals = files.map(function (f) { return f.code; });
    var state = files.map(function (f) { return { name: f.name, code: f.code }; });
    var active = 0;
    var page = (state.filter(function (f) { return langOf(f.name) === 'html'; })[0] || state[0]).name;

    var wrap = el('div', { class: 'bench pg-host' });
    if (opts.title) {
      var t = el('div', { class: 'bench-title' });
      t.appendChild(el('span', { class: 'kind', text: opts.kind || 'Playground' }));
      t.appendChild(el('strong', { text: opts.title }));
      wrap.appendChild(t);
    }
    var pg = el('div', { class: 'pg' + (opts.stack ? ' stack' : '') });
    var left = el('div', { class: 'pg-code' });
    var bar = el('div', { class: 'pg-bar' });
    var tabs = el('div', { class: 'pg-tabs', role: 'tablist', 'aria-label': 'Files' });
    state.forEach(function (f, i) {
      var b = el('button', { class: 'pg-tab', role: 'tab', type: 'button', 'aria-selected': i === 0 ? 'true' : 'false' }, esc(f.name));
      b.addEventListener('click', function () { select(i); });
      tabs.appendChild(b);
    });
    bar.appendChild(tabs);
    var actions = el('div', { class: 'pg-actions' });
    var reset = el('button', { class: 'mini-btn', type: 'button', title: 'Undo all your changes' }, 'Reset');
    var copy = el('button', { class: 'mini-btn copy-btn', type: 'button', title: 'Copy this code' }, 'Copy');
    actions.appendChild(reset); actions.appendChild(copy);
    bar.appendChild(actions);
    left.appendChild(bar);

    var timer;
    var editor = new Editor(function (v) {
      state[active].code = v;
      clearTimeout(timer);
      timer = setTimeout(render, 220);
    });
    left.appendChild(editor.root);
    pg.appendChild(left);

    var preview = new Preview({
      devices: opts.devices,
      height: opts.height,
      files: state,
      onNavigate: function (name) {
        page = name;
        var idx = -1;
        state.forEach(function (f, i) { if (f.name === name) idx = i; });
        if (idx >= 0) select(idx, true); else render();
      }
    });
    pg.appendChild(preview.view);
    wrap.appendChild(pg);
    if (opts.hint !== false) {
      wrap.appendChild(el('p', { class: 'bench-hint' }, opts.hint || (state.length > 1
        ? 'Each tab is a separate file. Click the links on the website to move between pages.'
        : (opts.stack ? 'Type in the code. The website below updates by itself.' : 'Type in the code. The website updates by itself as you type.'))));
    }

    function select(i, fromNav) {
      active = i;
      tabs.querySelectorAll('.pg-tab').forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
      editor.set(state[i].code, langOf(state[i].name));
      if (langOf(state[i].name) === 'html') page = state[i].name;
      render();
      if (fromNav) { /* keep focus on preview */ }
    }
    function buildPage(name) {
      var f = state.filter(function (x) { return x.name === name; })[0] || state[0];
      var html = f.code;
      if (langOf(f.name) === 'css') return '<style>' + f.code + '</style>';
      return html.replace(/<link\b[^>]*?href=["']\.?\/?([^"']+\.css)["'][^>]*>/gi, function (m, href) {
        var css = state.filter(function (x) { return x.name === href; })[0];
        return css ? '<style>\n' + css.code + '\n</style>' : m;
      });
    }
    function render() { preview.write(buildPage(page), page); }

    reset.addEventListener('click', function () {
      state.forEach(function (f, i) { f.code = originals[i]; });
      select(active);
    });
    copy.addEventListener('click', function () { copyText(state[active].code, copy); });

    host.parentNode.replaceChild(wrap, host);
    select(0);
    return wrap;
  }

  function readFiles(host) {
    var scripts = host.querySelectorAll('script[type="text/plain"]');
    var files = [];
    scripts.forEach(function (s, i) {
      files.push({ name: s.getAttribute('data-name') || (i === 0 ? 'index.html' : 'page' + i + '.html'), code: dedent(s.textContent) });
    });
    return files;
  }

  /* ============================================================
     Explorer = sliders + code + preview
     ============================================================ */
  function makeExplorer(host) {
    var tplScript = host.querySelector('script[type="text/plain"]:not([data-for])');
    var tpl = dedent(tplScript.textContent);
    var slots = {};
    host.querySelectorAll('script[type="text/plain"][data-for]').forEach(function (s) { slots[s.getAttribute('data-for')] = dedent(s.textContent); });
    var inputs = Array.prototype.slice.call(host.querySelectorAll('input, select'));
    var n = ++uid;

    var wrap = el('div', { class: 'bench ex-host' });
    var t = el('div', { class: 'bench-title' });
    t.appendChild(el('span', { class: 'kind', text: 'Explorer' }));
    t.appendChild(el('strong', { text: host.getAttribute('data-title') || 'Try the controls' }));
    wrap.appendChild(t);
    var ex = el('div', { class: 'ex' });
    var controls = el('div', { class: 'ex-controls' });
    var outputs = {};
    inputs.forEach(function (inp) {
      var name = inp.getAttribute('name');
      var id = 'ex' + n + '-' + name;
      inp.id = id;
      var isCheck = inp.type === 'checkbox';
      var ctl = el('div', { class: 'ctl' + (isCheck ? ' check' : '') });
      var lab = el('label', { for: id });
      var nm = el('span', { class: 'ctl-name', text: inp.getAttribute('data-label') || name });
      if (isCheck) {
        lab.appendChild(inp);
        lab.appendChild(nm);
        ctl.appendChild(lab);
      } else {
        var out = el('output', { for: id });
        outputs[name] = out;
        lab.appendChild(nm); lab.appendChild(out);
        ctl.appendChild(lab);
        ctl.appendChild(inp);
      }
      controls.appendChild(ctl);
      inp.addEventListener('input', update);
      inp.addEventListener('change', update);
    });
    ex.appendChild(controls);
    var bodyEl = el('div', { class: 'ex-body' });
    var pre = el('pre', { class: 'ex-code' });
    bodyEl.appendChild(pre);
    var preview = new Preview({ height: +host.getAttribute('data-height') || 0, devices: host.hasAttribute('data-devices') });
    bodyEl.appendChild(preview.view);
    ex.appendChild(bodyEl);
    var foot = el('div', { class: 'ex-foot' });
    var openBtn = el('button', { class: 'mini-btn', type: 'button' }, 'Edit this code yourself');
    foot.appendChild(openBtn);
    ex.appendChild(foot);
    wrap.appendChild(ex);
    host.parentNode.replaceChild(wrap, host);

    var last = {};
    function values() {
      var v = {};
      inputs.forEach(function (inp) {
        var name = inp.getAttribute('name');
        if (inp.type === 'checkbox') {
          if (inp.hasAttribute('data-on')) v[name] = inp.checked ? inp.getAttribute('data-on') : (inp.getAttribute('data-off') || '');
          else v[name] = inp.checked ? (slots[name] || '') : (inp.getAttribute('data-off') || '');
        } else {
          v[name] = inp.value + (inp.getAttribute('data-unit') || '');
        }
      });
      return v;
    }
    function fill(v, marks) {
      return tpl.replace(/\{\{(\w+)\}\}/g, function (m, k) { return marks ? '\u0001' + k + '\u0002' : (v[k] != null ? v[k] : ''); });
    }
    function update() {
      var v = values();
      inputs.forEach(function (inp) {
        var name = inp.getAttribute('name');
        if (outputs[name]) outputs[name].textContent = v[name];
      });
      var code = fill(v, false);
      var marked = highlight(fill(v, true), 'html');
      pre.innerHTML = marked.replace(/\u0001(\w+)\u0002/g, function (m, k) {
        var val = v[k] != null ? v[k] : '';
        if (val.indexOf('\n') >= 0) return '<mark class="live' + (last[k] !== val ? ' flash' : '') + '">' + highlight(val, 'html') + '</mark>';
        return '<mark class="live' + (last[k] !== val ? ' flash' : '') + '">' + esc(val) + '</mark>';
      });
      last = v;
      preview.write(code, 'index.html');
    }
    openBtn.addEventListener('click', function () {
      var holder = el('div');
      wrap.parentNode.insertBefore(holder, wrap.nextSibling);
      makePlayground(holder, [{ name: 'index.html', code: fill(values(), false) }], { title: 'Your copy of the explorer code' });
      openBtn.disabled = true;
      openBtn.textContent = 'Opened below';
    });
    update();
    last = values();
  }

  /* ============================================================
     Snippets, quizzes, swatches
     ============================================================ */
  function makeSnippet(s) {
    var code = dedent(s.textContent);
    var lang = s.getAttribute('data-lang') || 'html';
    var wrap = el('div', { class: 'snippet-wrap' });
    var pre = el('pre', { class: 'snippet' });
    pre.innerHTML = '<code>' + highlight(code, lang) + '</code>';
    var btn = el('button', { class: 'mini-btn copy-btn', type: 'button' }, 'Copy');
    btn.addEventListener('click', function () { copyText(code, btn); });
    wrap.appendChild(pre); wrap.appendChild(btn);
    s.parentNode.replaceChild(wrap, s);
  }

  function makeQuiz(q) {
    var label = el('p', { class: 'eyebrow', text: 'Quick check' });
    q.insertBefore(label, q.firstChild);
    var why = q.querySelector('.why');
    if (why) why.hidden = true;
    var fb = el('p', { class: 'feedback', 'aria-live': 'polite' });
    q.insertBefore(fb, why || null);
    q.querySelectorAll('.opts button').forEach(function (b) {
      b.type = 'button';
      b.addEventListener('click', function () {
        if (b.hasAttribute('data-correct')) {
          b.classList.add('right');
          fb.className = 'feedback good';
          fb.textContent = 'Correct!';
          if (why) why.hidden = false;
        } else {
          b.classList.add('wrong');
          fb.className = 'feedback bad';
          fb.textContent = 'Not quite. Try another answer.';
        }
      });
    });
  }

  function makeSwatches() {
    document.querySelectorAll('.swatch[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var label = b.querySelector('span');
        var old = label.innerHTML;
        copyText(b.getAttribute('data-copy'), null);
        label.innerHTML = 'Copied<small>' + esc(b.getAttribute('data-copy')) + '</small>';
        setTimeout(function () { label.innerHTML = old; }, 1300);
      });
    });
  }

  /* ============================================================
     Course menu, header, lesson end, home page map
     ============================================================ */
  function buildHeader() {
    var h = el('header', { class: 'site-header' });
    h.innerHTML = '<a class="logo" href="' + homeHref() + '"><span class="logo-mark">&lt;/&gt;</span>Hello HTML</a>' +
      '<span class="header-space"></span>' +
      '<div class="progress-pill"><span class="progress-text"></span><span class="progress-track"><span class="progress-fill"></span></span></div>';
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      var btn = el('button', { class: 'menu-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'sidebar' }, 'All lessons');
      h.appendChild(btn);
      var scrim;
      function close() {
        sidebar.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        if (scrim) { scrim.remove(); scrim = null; }
      }
      btn.addEventListener('click', function () {
        if (sidebar.classList.contains('open')) { close(); return; }
        sidebar.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        scrim = el('div', { class: 'scrim' });
        scrim.addEventListener('click', close);
        document.body.appendChild(scrim);
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
    body.insertBefore(h, body.firstChild);
  }

  function buildSidebar() {
    var sb = document.getElementById('sidebar');
    if (!sb) return;
    var html = '';
    var lastGroup = '';
    LESSONS.forEach(function (l, i) {
      if (l.group !== lastGroup) {
        if (lastGroup) html += '</ol>';
        html += '<h4>' + GROUPS[l.group].name + '</h4><ol>';
        lastGroup = l.group;
      }
      html += '<li><a href="' + lessonHref(l.id) + '" data-id="' + l.id + '"' + (l.id === CURRENT ? ' aria-current="page"' : '') + '>' +
        '<span class="num">' + String(i).padStart(2, '0') + '</span><span>' + esc(l.title) + '</span><span class="check" aria-hidden="true"></span></a></li>';
    });
    html += '</ol><div class="sidebar-extra"><ol><li><a href="' + lessonHref('cheatsheet') + '"' + (CURRENT === 'cheatsheet' ? ' aria-current="page"' : '') + '><span class="num">&#9733;</span><span>Cheat sheet</span><span></span></a></li>' +
      '<li><a href="' + homeHref() + '"><span class="num">&larr;</span><span>Course home</span><span></span></a></li></ol></div>';
    sb.innerHTML = html;
  }

  function refreshProgress() {
    var done = getDone();
    var count = LESSONS.filter(function (l) { return done.indexOf(l.id) >= 0; }).length;
    document.querySelectorAll('.progress-text').forEach(function (e) { e.textContent = count + ' of ' + LESSONS.length + ' lessons done'; });
    document.querySelectorAll('.progress-fill').forEach(function (e) { e.style.width = (count / LESSONS.length * 100) + '%'; });
    document.querySelectorAll('.sidebar a[data-id]').forEach(function (a) {
      var li = a.parentNode;
      li.classList.toggle('done', done.indexOf(a.getAttribute('data-id')) >= 0);
      a.querySelector('.check').setAttribute('title', done.indexOf(a.getAttribute('data-id')) >= 0 ? 'Done' : 'Not done yet');
    });
    document.querySelectorAll('.card[data-id]').forEach(function (c) { c.classList.toggle('done', done.indexOf(c.getAttribute('data-id')) >= 0); });
  }

  function buildLessonEnd() {
    var end = document.querySelector('.lesson-end');
    if (!end || !current) return;
    var i = LESSONS.indexOf(current);
    var prev = LESSONS[i - 1], next = LESSONS[i + 1];
    var box = el('div', { class: 'done-box' });
    box.innerHTML = '<div><h3>Finished this lesson?</h3><p>Mark it done to fill your progress bar.</p></div>';
    var btn = el('button', { class: 'btn done-btn', type: 'button' });
    function paint() {
      var d = isDone(current.id);
      btn.setAttribute('aria-pressed', String(d));
      btn.textContent = d ? 'Done ✓' : 'Mark as done';
    }
    btn.addEventListener('click', function () { toggleDone(current.id); paint(); });
    paint();
    box.appendChild(btn);
    end.appendChild(box);
    var pager = el('nav', { class: 'pager', 'aria-label': 'Lesson navigation' });
    if (prev) pager.innerHTML += '<a class="prev" href="' + lessonHref(prev.id) + '"><small>&larr; Previous</small><strong>' + esc(prev.title) + '</strong></a>';
    if (next) pager.innerHTML += '<a class="next" href="' + lessonHref(next.id) + '"><small>Next lesson &rarr;</small><strong>' + esc(next.title) + '</strong></a>';
    else pager.innerHTML += '<a class="next" href="' + lessonHref('cheatsheet') + '"><small>Keep it handy &rarr;</small><strong>Cheat sheet</strong></a>';
    end.appendChild(pager);
  }

  function buildMap() {
    var map = document.getElementById('course-map');
    if (!map) return;
    var html = '';
    var lastGroup = '';
    LESSONS.forEach(function (l, i) {
      if (l.group !== lastGroup) {
        if (lastGroup) html += '</div></div>';
        html += '<div class="map-group" style="--gc: var(' + GROUPS[l.group].color + ')"><h3>' + GROUPS[l.group].name + '</h3><div class="cards">';
        lastGroup = l.group;
      }
      html += '<a class="card" data-id="' + l.id + '" href="' + lessonHref(l.id) + '"><span class="n">' + String(i).padStart(2, '0') + '</span>' +
        '<span class="chip">' + esc(l.chip) + '</span><strong>' + esc(l.title) + '</strong><p>' + esc(l.blurb) + '</p></a>';
    });
    html += '</div></div>';
    map.innerHTML = html;
  }

  function buildCheatFilter() {
    var input = document.getElementById('cheat-filter');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      document.querySelectorAll('.cheat').forEach(function (sec) {
        var any = false;
        sec.querySelectorAll('tbody tr').forEach(function (tr) {
          var hit = !q || tr.textContent.toLowerCase().indexOf(q) >= 0;
          tr.hidden = !hit;
          if (hit) any = true;
        });
        sec.hidden = !any;
      });
    });
  }

  /* ---------- Boot ---------- */
  buildSidebar();
  buildHeader();
  buildMap();
  buildLessonEnd();
  refreshProgress();
  buildCheatFilter();
  makeSwatches();
  document.querySelectorAll('script.snippet').forEach(makeSnippet);
  document.querySelectorAll('.quiz').forEach(makeQuiz);
  document.querySelectorAll('.playground').forEach(function (host) {
    makePlayground(host, readFiles(host), {
      title: host.getAttribute('data-title'),
      devices: host.hasAttribute('data-devices'),
      height: +host.getAttribute('data-height') || 0,
      stack: host.hasAttribute('data-stack'),
      hint: host.hasAttribute('data-hint') ? host.getAttribute('data-hint') : undefined
    });
  });
  document.querySelectorAll('.explorer').forEach(makeExplorer);
})();
