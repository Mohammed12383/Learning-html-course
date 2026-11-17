/* ============================================================
   Hello courses: code runners.
   Adds to the course engine (course.js):
   - syntax colors for Python, TypeScript and C++
   - .runner        an editor + Run button + output (and drawings or a web page)
   - .code-explorer sliders that change a program and run it again
   - .stepper       watch a program run one line at a time
   Python runs with Skulpt, TypeScript with the real TypeScript compiler
   (both inside this page), C++ with a free online compiler (needs internet).
   You don't need to understand this file to take the course!
   ============================================================ */
(window.HelloCourseExtensions = window.HelloCourseExtensions || []).push(function (api) {
  'use strict';
  var el = api.el, esc = api.esc, dedent = api.dedent;

  /* ============================================================
     Syntax colors
     ============================================================ */
  function sp(cls, s) { return s ? (cls ? '<span class="t-' + cls + '">' + esc(s) + '</span>' : esc(s)) : ''; }

  // A tiny tokenizer: at each position, try the rules in order.
  function makeTokenizer(rules) {
    return function tok(src) {
      var out = '', i = 0, n = src.length, plain = '';
      outer: while (i < n) {
        for (var r = 0; r < rules.length; r++) {
          var rule = rules[r];
          rule.re.lastIndex = i;
          var m = rule.re.exec(src);
          if (m && m[0].length) {
            if (plain) { out += esc(plain); plain = ''; }
            out += typeof rule.out === 'function' ? rule.out(m, tok) : sp(rule.out, m[0]);
            i += m[0].length;
            continue outer;
          }
        }
        plain += src[i];
        i++;
      }
      return out + esc(plain);
    };
  }
  function words(list) { return '\\b(?:' + list.replace(/\s+/g, '|') + ')\\b'; }
  function R(re, out) { return { re: new RegExp(re.source || re, 'y'), out: out }; }

  /* Python */
  var PY_KW = 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case';
  var PY_BI = 'print input len range int float str list dict set tuple bool type sorted sum min max abs round enumerate zip open isinstance super map filter any all reversed chr ord';
  function pyString(m, tok) {
    var s = m[0];
    var prefix = /^[a-zA-Z]*/.exec(s)[0];
    if (!/f/i.test(prefix)) return sp('str', s);
    // f-string: color the {expressions} as code
    var out = '', buf = '', depth = 0, expr = '';
    for (var k = 0; k < s.length; k++) {
      var c = s[k];
      if (depth === 0) {
        if (c === '{' && s[k + 1] === '{') { buf += '{{'; k++; continue; }
        if (c === '{') { out += sp('str', buf); buf = ''; depth = 1; out += sp('punc', '{'); continue; }
        buf += c;
      } else {
        if (c === '{') depth++;
        if (c === '}') depth--;
        if (depth === 0) { out += tok(expr) + sp('punc', '}'); expr = ''; continue; }
        expr += c;
      }
    }
    return out + sp('str', buf) + (expr ? tok(expr) : '');
  }
  var hlPython = makeTokenizer([
    R(/#[^\n]*/, 'com'),
    R(/[rRbBfFuU]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/, pyString),
    R(/[rRbBfFuU]{0,2}(?:"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)/, pyString),
    R(/@[A-Za-z_]\w*/, 'sel'),
    R(/\b(def|class)(\s+)([A-Za-z_]\w*)/, function (m) { return sp('tag', m[1]) + m[2] + sp(m[1] === 'def' ? 'prop' : 'sel', m[3]); }),
    R(/\b\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?\b|\.\d+\b/, 'attr'),
    R(new RegExp(words(PY_KW)), 'tag'),
    R(/\bself\b/, 'attr'),
    R(new RegExp(words(PY_BI) + '(?=\\s*\\()'), 'prop'),
    R(/[A-Za-z_]\w*(?=\s*\()/, 'prop'),
    R(/[A-Za-z_]\w*/, ''),
    R(/[()[\]{}:,.;=+\-*/%<>!&|^~]/, 'punc')
  ]);

  /* TypeScript / JavaScript */
  var TS_KW = 'abstract as async await break case catch class const continue debugger declare default delete do else enum export extends false finally for from function get if implements import in instanceof interface keyof let namespace new null of private protected public readonly return satisfies set static super switch this throw true try type typeof undefined var void while yield';
  var TS_TYPES = 'string number boolean any unknown never object bigint symbol';
  function tsTemplate(src, pos, tok) {
    // returns [html, length] for a `template ${literal}`
    var out = '', buf = '`', k = pos + 1, n = src.length;
    while (k < n) {
      var c = src[k];
      if (c === '\\') { buf += src.substr(k, 2); k += 2; continue; }
      if (c === '`') { buf += c; k++; break; }
      if (c === '$' && src[k + 1] === '{') {
        out += sp('str', buf); buf = '';
        var depth = 1, j = k + 2;
        while (j < n && depth > 0) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; if (depth > 0) j++; }
        out += sp('punc', '${') + tok(src.slice(k + 2, j)) + (j < n ? sp('punc', '}') : '');
        k = j + 1;
        continue;
      }
      buf += c; k++;
    }
    return [out + sp('str', buf), k - pos];
  }
  var tsRules = [
    R(/\/\/[^\n]*/, 'com'),
    R(/\/\*[\s\S]*?(?:\*\/|$)/, 'com'),
    R(/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/, 'str'),
    R(/\b(class|interface|type|enum|extends|implements|new)(\s+)([A-Za-z_$][\w$]*)/, function (m) { return sp('tag', m[1]) + m[2] + sp('sel', m[3]); }),
    R(/\b(function)(\s+)([A-Za-z_$][\w$]*)/, function (m) { return sp('tag', m[1]) + m[2] + sp('prop', m[3]); }),
    R(/\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?n?)\b|\.\d+\b/, 'attr'),
    R(new RegExp(words(TS_KW)), 'tag'),
    R(new RegExp(words(TS_TYPES)), 'sel'),
    R(/[A-Za-z_$][\w$]*(?=\s*(?:<[\w$\s,<>[\]|]*>)?\s*\()/, 'prop'),
    R(/[A-Z][\w$]*/, 'sel'),
    R(/[A-Za-z_$][\w$]*/, ''),
    R(/=>|[()[\]{}:,.;=+\-*/%<>!&|^~?]/, 'punc')
  ];
  var tsBase = makeTokenizer(tsRules);
  function hlTS(src) {
    // split out template literals first (they can contain code)
    var out = '', i = 0, last = 0, n = src.length;
    // scan, skipping strings/comments so a ` inside them isn't treated as a template
    var re = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`/g, m;
    while ((m = re.exec(src))) {
      if (m[0] !== '`') continue;
      out += tsBase(src.slice(last, m.index));
      var t = tsTemplate(src, m.index, hlTS);
      out += t[0];
      last = m.index + t[1];
      re.lastIndex = last;
    }
    return out + tsBase(src.slice(last));
  }

  /* C++ */
  var CPP_KW = 'alignas alignof auto break case catch class const constexpr const_cast continue default delete do dynamic_cast else enum explicit export extern false final for friend goto if inline mutable namespace new noexcept nullptr operator override private protected public reinterpret_cast return sizeof static static_cast struct switch template this throw true try typedef typename union using virtual volatile while';
  var CPP_TYPES = 'int double float char bool void long short unsigned signed size_t string vector map set array pair unordered_map wchar_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t';
  var hlCpp = makeTokenizer([
    R(/\/\/[^\n]*/, 'com'),
    R(/\/\*[\s\S]*?(?:\*\/|$)/, 'com'),
    R(/(#\s*include)(\s*)(<[^>\n]*>?|"[^"\n]*"?)/, function (m) { return sp('sel', m[1]) + m[2] + sp('str', m[3]); }),
    R(/#\s*\w+/, 'sel'),
    R(/"(?:\\.|[^"\\\n])*"?/, 'str'),
    R(/'(?:\\.|[^'\\\n])*'?/, 'str'),
    R(/\b(class|struct|enum)(\s+)([A-Za-z_]\w*)/, function (m) { return sp('tag', m[1]) + m[2] + sp('sel', m[3]); }),
    R(/\b(?:0[xX][\da-fA-F']+|\d[\d']*(?:\.\d*)?(?:[eE][+-]?\d+)?[fFuUlL]*)\b|\.\d+\b/, 'attr'),
    R(new RegExp(words(CPP_KW)), 'tag'),
    R(new RegExp(words(CPP_TYPES)), 'sel'),
    R(/\b(?:cout|cin|endl|getline|cerr)\b/, 'prop'),
    R(/[A-Za-z_]\w*(?=\s*(?:<[\w\s,<>:*&]*>)?\s*\()/, 'prop'),
    R(/[A-Z]\w*/, 'sel'),
    R(/[A-Za-z_]\w*/, ''),
    R(/<<|>>|::|->|[()[\]{}:,.;=+\-*/%<>!&|^~?]/, 'punc')
  ]);

  api.registerLang('python', hlPython);
  api.registerLang('typescript', hlTS);
  api.registerLang('cpp', hlCpp);

  /* ============================================================
     Friendly explanations for common errors
     ============================================================ */
  var PY_HELP = {
    NameError: 'Python doesn\'t know this name. Check the spelling (capital letters matter), and make sure the variable was created on an earlier line.',
    SyntaxError: 'Python couldn\'t understand this line. Look for a missing bracket, quote or colon (:). The real mistake is often at the end of the line before.',
    IndentationError: 'The spaces at the start of a line are wrong. Lines inside an if, for, while or def must be pushed in by 4 spaces, and lines that belong together must line up.',
    TypeError: 'Two kinds of values that don\'t go together, like adding a number to text. Convert one of them first with str(), int() or float().',
    ValueError: 'The value is the right kind but its content is wrong, like int("hello"). Check what you typed.',
    ZeroDivisionError: 'You divided by zero, which is impossible. Check the number you divide by.',
    IndexError: 'You asked for a position that doesn\'t exist. Remember: the first item is at position 0, and the last is at len(list) - 1.',
    KeyError: 'That key isn\'t in the dictionary. Check the spelling, or use .get() to be safe.',
    AttributeError: 'This kind of value doesn\'t have that method or property. Check the spelling.',
    TimeLimitError: 'The program ran for too long. A loop probably never stops.',
    RecursionError: 'A function kept calling itself forever. Make sure it has a way to stop.'
  };
  var TS_HELP = {
    2322: 'You stored a value of the wrong type. The variable expects one type, but the value is another.',
    2345: 'You gave a function a value of the wrong type.',
    2304: 'TypeScript doesn\'t know this name. Check the spelling, or create it first.',
    2552: 'TypeScript doesn\'t know this name. It suggests a name that you may have meant.',
    2339: 'This value doesn\'t have that property or method. Check the spelling, or add it to the type.',
    2551: 'This property doesn\'t exist. TypeScript suggests one you may have meant.',
    2741: 'The object is missing a property that its type requires.',
    2739: 'The object is missing some properties that its type requires.',
    2353: 'This object has a property that its type doesn\'t allow. Check the spelling.',
    2554: 'You called the function with the wrong number of values.',
    2588: 'You can\'t change a const. Use let if the value needs to change.',
    18047: 'This might be null (missing). Check that it exists first, for example with an if, or add ! if you are sure.',
    18048: 'This might be undefined. Check that it has a value first.',
    2531: 'This might be null (missing). Check that it exists first.',
    2532: 'This might be undefined. Check that it has a value first.',
    7006: 'Give this parameter a type, like (name: string).',
    2367: 'These two can never be equal, so this comparison is always false.',
    2365: 'This operator doesn\'t work with these types.',
    2362: 'Math only works with numbers.',
    2349: 'This isn\'t a function, so you can\'t call it with ().',
    2451: 'There are two variables with the same name. Rename one of them.',
    1005: 'Something is missing here, like a bracket, comma or semicolon.',
    1128: 'TypeScript expected a statement here. Check for an extra or missing bracket.',
    1109: 'An expression is missing here.'
  };
  var CPP_HELP = [
    [/expected ['‘`]?[,;]['’`]?(?: or ['‘`]?[;,]['’`]?)? before/, 'You probably forgot a semicolon ; at the end of the line before this one.'],
    [/was not declared in this scope/, 'C++ doesn\'t know this name. Check the spelling, create the variable before using it, and check the #include lines and "using namespace std;".'],
    [/does not name a type/, 'C++ doesn\'t recognise this type. Check the spelling, or add the #include it needs.'],
    [/no match for ['‘]operator/, 'This operator (like << or +) doesn\'t work with these kinds of values.'],
    [/invalid conversion|cannot convert/, 'You are putting a value of one type into a variable of a different type.'],
    [/expected ['‘][)}\]]['’]/, 'A bracket is missing. Every ( needs a ), and every { needs a }.'],
    [/expected primary-expression/, 'Something is missing in this expression, like a value or a variable name.'],
    [/missing terminating/, 'A text in quotes is missing its closing quote.'],
    [/redeclaration|conflicting declaration|redefinition/, 'Two things have the same name. Rename one of them.'],
    [/too few arguments|too many arguments/, 'You called the function with the wrong number of values.'],
    [/assignment of read-only|read-only variable/, 'You can\'t change a const variable.'],
    [/is private within this context/, 'This member is private, so only code inside the class can use it.'],
    [/no matching function for call/, 'No function matches the values you passed. Check the number and the types of the values.'],
    [/expected unqualified-id/, 'Something unexpected is here. Check for an extra bracket or a missing semicolon above.']
  ];
  function cppHelp(msg) {
    for (var k = 0; k < CPP_HELP.length; k++) if (CPP_HELP[k][0].test(msg)) return CPP_HELP[k][1];
    return '';
  }

  /* ============================================================
     The output panel shared by runners and explorers
     ============================================================ */
  function Output(opts) {
    var self = this;
    this.lang = opts.lang;
    var view = el('div', { class: 'pg-view run-view' });
    var bar = el('div', { class: 'pg-bar run-bar' });
    bar.appendChild(el('span', { class: 'pg-label', text: opts.page ? 'Result' : 'Output' }));
    this.status = el('span', { class: 'run-status', 'data-state': 'idle' }, 'Ready');
    bar.appendChild(this.status);
    var actions = el('div', { class: 'pg-actions' });
    this.stopBtn = el('button', { class: 'mini-btn', type: 'button', hidden: '' }, 'Stop');
    this.clearBtn = el('button', { class: 'mini-btn', type: 'button' }, 'Clear');
    actions.appendChild(this.stopBtn); actions.appendChild(this.clearBtn);
    bar.appendChild(actions);
    view.appendChild(bar);

    if (opts.page && api.Preview) {
      this.preview = new api.Preview({ height: opts.height || 0, quietForms: true });
      this.preview.view.classList.add('embedded-preview');
      view.appendChild(this.preview.view);
    }
    if (opts.lang === 'python') {
      this.turtle = el('div', { class: 'turtle-stage', id: 'turtle-' + api.nextId(), hidden: '' });
      view.appendChild(this.turtle);
    }
    if (opts.stdin) {
      var box = el('div', { class: 'stdin-box' });
      var sid = 'stdin-' + api.nextId();
      box.appendChild(el('label', { for: sid }, 'Input for <code>cin</code> <small>(one answer per line, typed before you press Run)</small>'));
      this.stdin = el('textarea', { id: sid, rows: '2', spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' });
      this.stdin.value = opts.stdinValue || '';
      box.appendChild(this.stdin);
      view.appendChild(box);
    }
    this.console = el('div', { class: 'console', role: 'log', 'aria-live': 'polite' });
    if (opts.page) this.console.classList.add('console-small');
    view.appendChild(this.console);
    this.view = view;
    this.clearBtn.addEventListener('click', function () { self.clear(); });
  }
  Output.prototype.setStatus = function (state, text) {
    this.status.setAttribute('data-state', state);
    this.status.textContent = text;
    this.stopBtn.hidden = state !== 'running' && state !== 'waiting';
  };
  Output.prototype.clear = function () { this.console.innerHTML = ''; };
  Output.prototype.write = function (text, kind) {
    var c = this.console;
    var last = c.lastChild;
    if (last && last.nodeType === 1 && last.getAttribute('data-kind') === (kind || 'out') && !last.classList.contains('closed')) {
      last.textContent += text;
    } else {
      var s = el('span', { class: 'c-' + (kind || 'out'), 'data-kind': kind || 'out' });
      s.textContent = text;
      c.appendChild(s);
    }
    c.scrollTop = c.scrollHeight;
  };
  Output.prototype.note = function (html, kind) {
    var d = el('div', { class: 'c-note ' + (kind || '') }, html);
    this.console.appendChild(d);
    this.console.scrollTop = this.console.scrollHeight;
    return d;
  };
  Output.prototype.error = function (title, message, help) {
    var d = el('div', { class: 'c-error' });
    d.innerHTML = '<strong>' + esc(title) + '</strong>' + (message ? '<div class="msg">' + esc(message) + '</div>' : '') +
      (help ? '<div class="help"><b>What this means:</b> ' + esc(help) + '</div>' : '');
    this.console.appendChild(d);
    this.console.scrollTop = this.console.scrollHeight;
  };
  // Ask the person a question inside the output (for Python's input())
  Output.prototype.ask = function (resolve) {
    var self = this;
    var wrap = el('div', { class: 'c-ask' });
    var id = 'ask-' + api.nextId();
    var inp = el('input', { type: 'text', id: id, autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Your answer' });
    var btn = el('button', { class: 'mini-btn', type: 'button' }, 'Enter ↵');
    wrap.appendChild(inp); wrap.appendChild(btn);
    this.console.appendChild(wrap);
    this.console.scrollTop = this.console.scrollHeight;
    try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    function send() {
      var v = inp.value;
      wrap.remove();
      self.write(v + '\n', 'in');
      resolve(v);
    }
    btn.addEventListener('click', send);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
    return wrap;
  };

  /* ============================================================
     Python (Skulpt)
     ============================================================ */
  // Python runs one program at a time. Examples that start by themselves wait
  // their turn; pressing Run jumps the queue and pauses whatever is running.
  var PY = { current: null, waiting: [] };
  function pyCancel(job, reason) {
    job.stop = true;
    job.reason = reason;
    if (job.cancelAsk) job.cancelAsk();
  }
  function pyPump() {
    if (PY.current || !PY.waiting.length) return;
    var job = PY.waiting.shift();
    if (job.stop) { pyPump(); return; }
    PY.current = job;
    job.start().then(function () { PY.current = null; pyPump(); });
  }
  function pyRead(f) {
    if (!window.Sk || !Sk.builtinFiles || !Sk.builtinFiles.files[f]) throw 'File not found: \'' + f + '\'';
    return Sk.builtinFiles.files[f];
  }
  function runPython(code, out, editor, auto) {
    if (!window.Sk) {
      out.error('Python is not loaded', 'The Python engine (Skulpt) did not load on this page.');
      return;
    }
    var job = { stop: false, out: out };
    PY.waiting.forEach(function (j) { if (j.out === out) j.stop = true; });
    if (PY.current && (PY.current.out === out || !auto)) pyCancel(PY.current, PY.current.out === out ? 'restart' : 'other');
    job.start = function () {
      if (job.stop) return Promise.resolve();
      out.clear();
      if (editor) editor.setMarks([]);
      var usesTurtle = /\bturtle\b/.test(code);
      if (out.turtle) {
        out.turtle.hidden = !usesTurtle;
        out.turtle.innerHTML = '';
      }
      out.setStatus('running', 'Running…');
      var t0 = Date.now();
      Sk.configure({
        output: function (t) { if (!job.stop) out.write(t); },
        read: pyRead,
        inputfun: function (prompt) {
          return new Promise(function (resolve, reject) {
            if (prompt) out.write(prompt);
            out.setStatus('waiting', 'Waiting for your answer');
            var box = out.ask(function (v) { job.cancelAsk = null; out.setStatus('running', 'Running…'); resolve(v); });
            job.cancelAsk = function () { box.remove(); reject(new Error('Stopped')); };
          });
        },
        inputfunTakesPrompt: true,
        __future__: Sk.python3,
        yieldLimit: 100,
        killableWhile: true,
        killableFor: true
      });
      Sk.sysmodules = new Sk.builtin.dict([]);
      Sk.TurtleGraphics = { target: out.turtle ? out.turtle.id : null, width: 400, height: 300 };
      out.stopBtn.onclick = function () { pyCancel(job, 'you'); };
      return Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody('<stdin>', false, code, true);
      }, { '*': function () { if (job.stop) throw new Error('Stopped'); } }).then(function () {
        var secs = (Date.now() - t0) / 1000;
        out.setStatus('done', secs < 0.1 ? 'Finished' : 'Finished in ' + secs.toFixed(1) + 's');
        if (!out.console.textContent && !usesTurtle) out.note('The program ran, but it didn\'t print anything. Use print() to show something here.', 'quiet');
      }, function (e) {
        if (job.stop) {
          if (job.reason === 'restart') return;
          out.setStatus('idle', 'Stopped');
          out.note(job.reason === 'other' ? 'Paused so another example could run. Press Run to run this one again.' : 'You stopped the program.', 'quiet');
          return;
        }
        var text = (e && e.toString) ? e.toString() : String(e);
        var m = /^(\w+): ([\s\S]*?)(?: on line (\d+))?\s*$/.exec(text);
        var type = m ? m[1] : 'Error', msg = m ? m[2] : text, line = m && m[3] ? +m[3] : 0;
        if (/TimeLimit/.test(type)) type = 'TimeLimitError';
        out.setStatus('error', 'Error' + (line ? ' on line ' + line : ''));
        out.error(type + (line ? ' on line ' + line : ''), msg, PY_HELP[type] || '');
        if (editor && line) editor.setMarks([{ line: line, kind: 'error' }]);
      });
    };
    if (auto) PY.waiting.push(job); else PY.waiting.unshift(job);
    pyPump();
  }

  /* ============================================================
     TypeScript (the real compiler, inside the page)
     ============================================================ */
  var TSV = null;
  function tsService() {
    if (TSV) return TSV;
    if (!window.ts) return null;
    var files = {}, versions = {};
    var libs = window.TS_LIBS || {};
    var opts = {
      target: ts.ScriptTarget.ES2020,
      lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
      strict: true,
      noEmit: true,
      moduleDetection: ts.ModuleDetectionKind.Force,
      types: []
    };
    var host = {
      getScriptFileNames: function () { return Object.keys(files); },
      getScriptVersion: function (f) { return String(versions[f] || 1); },
      getScriptSnapshot: function (f) {
        var t = files[f] !== undefined ? files[f] : libs[f];
        return t !== undefined ? ts.ScriptSnapshot.fromString(t) : undefined;
      },
      getCurrentDirectory: function () { return '/'; },
      getCompilationSettings: function () { return opts; },
      getDefaultLibFileName: function () { return '/lib.es2020.d.ts'; },
      fileExists: function (f) { return files[f] !== undefined || libs[f] !== undefined; },
      readFile: function (f) { return files[f] !== undefined ? files[f] : libs[f]; },
      directoryExists: function () { return true; },
      getDirectories: function () { return []; }
    };
    var ls = ts.createLanguageService(host, ts.createDocumentRegistry());
    TSV = {
      check: function (name, code) {
        files[name] = code;
        versions[name] = (versions[name] || 1) + 1;
        var d = [].concat(ls.getSyntacticDiagnostics(name), ls.getSemanticDiagnostics(name));
        return d.map(function (x) {
          var lc = x.file && x.start != null ? x.file.getLineAndCharacterOfPosition(x.start) : { line: 0, character: 0 };
          return { line: lc.line + 1, col: lc.character + 1, code: x.code, msg: ts.flattenDiagnosticMessageText(x.messageText, '\n') };
        });
      },
      transpile: function (code) {
        return ts.transpileModule(code, {
          compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
          transformers: { before: [loopGuard] }
        }).outputText;
      }
    };
    return TSV;
  }
  // Adds a safety check inside every loop, so a loop that never ends can't freeze the page.
  function loopGuard(ctx) {
    var f = ts.factory;
    function guard() {
      return f.createIfStatement(
        f.createBinaryExpression(f.createPrefixUnaryExpression(ts.SyntaxKind.PlusPlusToken, f.createIdentifier('__loops')), ts.SyntaxKind.GreaterThanToken, f.createNumericLiteral('10000000')),
        f.createThrowStatement(f.createNewExpression(f.createIdentifier('Error'), undefined, [f.createStringLiteral('A loop ran 10 million times, so it was stopped. It probably never ends.')])));
    }
    function block(body) { return f.createBlock([guard()].concat(ts.isBlock(body) ? body.statements : [body]), true); }
    function visit(node) {
      node = ts.visitEachChild(node, visit, ctx);
      if (ts.isWhileStatement(node)) return f.updateWhileStatement(node, node.expression, block(node.statement));
      if (ts.isDoStatement(node)) return f.updateDoStatement(node, block(node.statement), node.expression);
      if (ts.isForStatement(node)) return f.updateForStatement(node, node.initializer, node.condition, node.incrementor, block(node.statement));
      if (ts.isForOfStatement(node)) return f.updateForOfStatement(node, node.awaitModifier, node.initializer, node.expression, block(node.statement));
      if (ts.isForInStatement(node)) return f.updateForInStatement(node, node.initializer, node.expression, block(node.statement));
      return node;
    }
    return function (sf) { return ts.visitNode(sf, visit); };
  }

  // Show values the way a browser console does: [ 1, 2 ], { name: 'Rex' }
  function show(v, depth) {
    depth = depth || 0;
    if (typeof v === 'string') return depth ? '\'' + v + '\'' : v;
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';
    if (typeof v === 'bigint') return String(v) + 'n';
    if (typeof v !== 'object') return String(v);
    if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
    try {
      if (v instanceof v.constructor && v.constructor.name === 'Error' || (v && typeof v.message === 'string' && typeof v.stack === 'string')) return (v.name || 'Error') + ': ' + v.message;
    } catch (e) { /* ignore */ }
    if (Array.isArray(v)) return '[ ' + v.map(function (x) { return show(x, depth + 1); }).join(', ') + ' ]';
    var name = '';
    try { name = v.constructor && v.constructor.name; } catch (e) { name = ''; }
    if (name === 'Map') return 'Map(' + v.size + ') { ' + Array.from(v.entries()).map(function (e) { return show(e[0], depth + 1) + ' => ' + show(e[1], depth + 1); }).join(', ') + ' }';
    if (name === 'Set') return 'Set(' + v.size + ') { ' + Array.from(v.values()).map(function (x) { return show(x, depth + 1); }).join(', ') + ' }';
    if (v.nodeType === 1) return '<' + v.tagName.toLowerCase() + '>';
    var keys = Object.keys(v);
    var body = keys.map(function (k) { return k + ': ' + show(v[k], depth + 1); }).join(', ');
    return (name && name !== 'Object' ? name + ' ' : '') + (keys.length ? '{ ' + body + ' }' : '{}');
  }

  var HC = window.__hc = window.__hc || {};
  function runTS(code, out, editor, pageHtml) {
    var svc = tsService();
    if (!svc) { out.error('TypeScript is not loaded', 'The TypeScript compiler did not load on this page.'); return; }
    var js;
    try { js = svc.transpile(code); } catch (e) { out.error('Could not translate the code', String(e.message || e)); return; }
    var id = 'r' + api.nextId();
    out.clear();
    out.setStatus('running', 'Running…');
    var t0 = Date.now();
    var hadError = false;
    HC[id] = {
      log: function (kind, args) {
        var text = Array.prototype.map.call(args, function (a) { return show(a); }).join(' ');
        out.write(text + '\n', kind === 'error' ? 'err' : kind === 'warn' ? 'warn' : 'out');
      },
      error: function (e) {
        hadError = true;
        var msg = e && e.message ? e.message : String(e);
        var type = e && e.name ? e.name : 'Error';
        out.setStatus('error', 'Error');
        var help = /is not a function/.test(msg) ? 'You tried to call something that isn\'t a function.'
          : /Cannot read propert/.test(msg) ? 'You used a property of something that is null or undefined (missing).'
          : /loop ran 10 million/.test(msg) ? 'Check the loop\'s condition: something inside the loop must eventually make it false.'
          : /is not defined/.test(msg) ? 'This name doesn\'t exist when the code runs. Check the spelling.' : '';
        out.error(type + ' while running', msg, help);
      }
    };
    var prelude = '<script>(function(){var H=parent.__hc["' + id + '"];' +
      '["log","info","warn","error","debug"].forEach(function(k){console[k]=function(){H.log(k,arguments)}});' +
      'console.table=function(t){H.log("log",[t])};' +
      'window.onerror=function(m,s,l,c,e){H.error(e||m);return true};' +
      'window.addEventListener("unhandledrejection",function(ev){H.error(ev.reason)});' +
      'window.alert=function(m){H.log("log",["[alert] "+m])};})();<\/script>';
    var user = '<script>var __loops = 0;\n' + js.replace(/<\/script/gi, '<\\/script') + '\n<\/script>';
    var html;
    if (pageHtml != null) {
      html = pageHtml;
      html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, function (m) { return m + prelude; }) : prelude + html;
      html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, user + '</body>') : html + user;
      out.preview.write(html, 'index.html');
    } else {
      if (!out.hiddenFrame) {
        out.hiddenFrame = el('iframe', { class: 'hidden-runner', title: 'Program runner', 'aria-hidden': 'true', tabindex: '-1' });
        out.view.appendChild(out.hiddenFrame);
      }
      var doc = out.hiddenFrame.contentDocument;
      doc.open(); doc.write('<!DOCTYPE html><html><head>' + prelude + '</head><body>' + user + '</body></html>'); doc.close();
    }
    setTimeout(function () {
      if (!hadError) {
        out.setStatus('done', 'Finished');
        if (!out.console.textContent && pageHtml == null) out.note('The program ran, but it didn\'t log anything. Use console.log() to show something here.', 'quiet');
      }
    }, 30);
  }
  function showTSDiagnostics(diags, editor, box) {
    editor.setMarks(diags.map(function (d) { return { line: d.line, kind: 'error' }; }));
    box.innerHTML = '';
    box.hidden = !diags.length;
    if (!diags.length) return;
    var head = el('div', { class: 'diag-head' }, diags.length === 1 ? '1 type error' : diags.length + ' type errors');
    box.appendChild(head);
    diags.slice(0, 6).forEach(function (d) {
      var row = el('div', { class: 'diag-row' });
      row.innerHTML = '<span class="diag-line">Line ' + d.line + '</span><span class="diag-msg">' + esc(d.msg) + '</span>' +
        (TS_HELP[d.code] ? '<span class="diag-help">' + esc(TS_HELP[d.code]) + '</span>' : '');
      box.appendChild(row);
    });
  }

  /* ============================================================
     C++ (a free online compiler: Compiler Explorer, Wandbox as backup)
     ============================================================ */
  var GODBOLT_IDS = ['g152', 'g151', 'g142', 'g132'];
  function timeoutFetch(url, opts, ms) {
    var ctrl = window.AbortController ? new AbortController() : null;
    if (ctrl) opts.signal = ctrl.signal;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, opts).finally(function () { clearTimeout(timer); });
  }
  function parseGccErrors(text, fileTag) {
    var errs = [];
    var re = new RegExp('(?:' + fileTag + '):(\\d+):(\\d+): (error|warning|fatal error): ([^\\n]*)', 'g'), m;
    while ((m = re.exec(text))) errs.push({ line: +m[1], col: +m[2], kind: m[3], msg: m[4] });
    return errs;
  }
  function viaGodbolt(code, stdin, idx) {
    idx = idx || 0;
    var id = GODBOLT_IDS[idx];
    if (!id) return Promise.reject(new Error('no compiler'));
    return timeoutFetch('https://godbolt.org/api/compiler/' + id + '/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        source: code,
        options: {
          userArguments: '-std=c++20 -O1 -fdiagnostics-color=never',
          executeParameters: { stdin: stdin || '' },
          compilerOptions: { executorRequest: true },
          filters: { execute: true }
        }
      })
    }, 30000).then(function (r) {
      if (r.status === 404) return viaGodbolt(code, stdin, idx + 1);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().then(function (d) {
        var lines = function (a) { return (a || []).map(function (x) { return x.text; }).join('\n'); };
        var br = d.buildResult || {};
        var compileText = lines(br.stderr);
        return {
          compiled: br.code === 0 || d.didExecute,
          compileText: compileText,
          errors: parseGccErrors(compileText, '<source>'),
          stdout: d.didExecute ? lines(d.stdout) + ((d.stdout || []).length ? '\n' : '') : '',
          stderr: d.didExecute ? lines(d.stderr) : '',
          exitCode: d.code,
          timedOut: !!d.timedOut,
          service: 'Compiler Explorer, GCC'
        };
      });
    });
  }
  function viaWandbox(code, stdin) {
    return timeoutFetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'gcc-head', code: code, stdin: stdin || '', 'compiler-option-raw': '-std=c++20' })
    }, 30000).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().then(function (d) {
        if (/OCI runtime|Resource temporarily/.test(d.compiler_error || '')) throw new Error('busy');
        var errs = parseGccErrors(d.compiler_error || '', 'prog\\.cc');
        var failedCompile = errs.some(function (e) { return e.kind !== 'warning'; });
        return {
          compiled: !failedCompile,
          compileText: (d.compiler_error || '').replace(/prog\.cc/g, '<source>'),
          errors: errs,
          stdout: d.program_output || '',
          stderr: d.program_error || '',
          exitCode: +d.status,
          timedOut: /Killed|time/i.test(d.signal || ''),
          service: 'Wandbox, GCC'
        };
      });
    });
  }
  function compileCpp(code, stdin) {
    return viaGodbolt(code, stdin).catch(function () { return viaWandbox(code, stdin); });
  }
  function runCpp(code, out, editor, expected, original) {
    out.clear();
    if (editor) editor.setMarks([]);
    out.setStatus('running', 'Compiling…');
    out.note('Sending your code to the online compiler…', 'quiet');
    var t0 = Date.now();
    var stdin = out.stdin ? out.stdin.value.replace(/\s*$/, '\n') : '';
    return compileCpp(code, stdin).then(function (r) {
      out.clear();
      var errs = r.errors.filter(function (e) { return e.kind !== 'warning'; });
      if (!r.compiled || errs.length) {
        out.setStatus('error', 'Didn\'t compile');
        if (editor) editor.setMarks(errs.map(function (e) { return { line: e.line, kind: 'error' }; }));
        if (!errs.length) out.error('The compiler found a problem', r.compileText);
        errs.slice(0, 4).forEach(function (e) { out.error('Error on line ' + e.line, e.msg, cppHelp(e.msg)); });
        return;
      }
      if (r.stdout) out.write(r.stdout);
      if (r.stderr) out.write(r.stderr, 'err');
      if (r.timedOut) out.error('Stopped: it ran too long', 'The program took too long, so it was stopped.', 'A loop probably never ends.');
      else if (r.exitCode && r.exitCode !== 0) out.note('The program ended with error code ' + r.exitCode + '. That usually means it crashed (for example, reading outside an array).', 'warn');
      if (!r.stdout && !r.stderr && !r.timedOut) out.note('The program ran, but it didn\'t print anything. Use cout to show something here.', 'quiet');
      out.setStatus('done', 'Done in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }, function () {
      out.clear();
      out.setStatus('error', 'Offline');
      if (expected != null && code === original) {
        out.note('Can\'t reach the online compiler right now (are you offline?). This is what this program prints:', 'warn');
        out.write(expected);
      } else {
        out.error('Can\'t reach the online compiler', 'C++ needs an internet connection to compile and run in this course.', 'Check your internet connection and press Run again. Press Reset to see the example\'s saved output.');
      }
    });
  }

  /* ============================================================
     Runner component
     ============================================================ */
  var visibleQueue = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.target.__onVisible) { var f = e.target.__onVisible; e.target.__onVisible = null; visibleQueue.unobserve(e.target); f(); }
    });
  }, { rootMargin: '200px' }) : null;
  function whenVisible(node, fn) {
    if (!visibleQueue) { fn(); return; }
    node.__onVisible = fn;
    visibleQueue.observe(node);
  }

  var FILE_NAMES = { python: 'main.py', typescript: 'main.ts', cpp: 'main.cpp' };

  function makeRunner(host, preset) {
    var lang = (preset && preset.lang) || host.getAttribute('data-lang') || 'python';
    var scripts = host ? Array.prototype.slice.call(host.querySelectorAll('script[type="text/plain"]')) : [];
    var codeScript = scripts.filter(function (s) { return !s.hasAttribute('data-expected') && !/\.html$/.test(s.getAttribute('data-name') || ''); })[0];
    var pageScript = scripts.filter(function (s) { return /\.html$/.test(s.getAttribute('data-name') || ''); })[0];
    var expScript = scripts.filter(function (s) { return s.hasAttribute('data-expected'); })[0];
    var original = preset ? preset.code : dedent(codeScript ? codeScript.textContent : '');
    var pageOriginal = pageScript ? dedent(pageScript.textContent) : null;
    var expected = expScript ? expScript.textContent.replace(/^\n/, '') : null;
    var get = function (a) { return host ? host.getAttribute(a) : null; };
    var title = preset ? preset.title : get('data-title');
    var stack = (host && host.hasAttribute('data-stack')) || !!pageScript;
    var wantsStdin = lang === 'cpp' && (/\bcin\b|getline\s*\(/.test(original) || (host && host.hasAttribute('data-input')));
    var autoRun = lang !== 'cpp' && !(host && host.hasAttribute('data-noauto')) && !/\binput\s*\(/.test(original);

    var wrap = el('div', { class: 'bench run-host' });
    if (title) {
      var t = el('div', { class: 'bench-title' });
      t.appendChild(el('span', { class: 'kind', text: preset && preset.kind ? preset.kind : 'Try it' }));
      t.appendChild(el('strong', { text: title }));
      wrap.appendChild(t);
    }
    var pg = el('div', { class: 'pg runner' + (stack ? ' stack' : '') });
    var left = el('div', { class: 'pg-code' });
    var bar = el('div', { class: 'pg-bar' });
    var tabs = el('div', { class: 'pg-tabs', role: 'tablist', 'aria-label': 'Files' });
    var files = [{ name: (codeScript && codeScript.getAttribute('data-name')) || FILE_NAMES[lang], code: original, lang: lang }];
    if (pageOriginal != null) files.push({ name: pageScript.getAttribute('data-name'), code: pageOriginal, lang: 'html' });
    var active = 0;
    files.forEach(function (f, i) {
      var b = el('button', { class: 'pg-tab', role: 'tab', type: 'button', 'aria-selected': i === 0 ? 'true' : 'false' }, esc(f.name));
      b.addEventListener('click', function () { select(i); });
      tabs.appendChild(b);
    });
    bar.appendChild(tabs);
    var actions = el('div', { class: 'pg-actions' });
    var runBtn = el('button', { class: 'run-btn', type: 'button', title: 'Run the program (Ctrl+Enter)' }, '<span aria-hidden="true">▶</span> Run');
    var reset = el('button', { class: 'mini-btn', type: 'button', title: 'Undo all your changes' }, 'Reset');
    var copy = el('button', { class: 'mini-btn', type: 'button', title: 'Copy this code' }, 'Copy');
    actions.appendChild(runBtn); actions.appendChild(reset); actions.appendChild(copy);
    bar.appendChild(actions);
    left.appendChild(bar);

    var idle;
    var editor = new api.Editor(function (v) {
      files[active].code = v;
      if (lang === 'typescript' && files[active].lang === 'typescript') { clearTimeout(checkTimer); checkTimer = setTimeout(check, 250); }
      clearTimeout(idle);
      if (autoRun && !/\binput\s*\(/.test(files[0].code)) idle = setTimeout(function () { run(true); }, lang === 'python' ? 900 : 700);
    });
    left.appendChild(editor.root);
    var diagBox = el('div', { class: 'diag', hidden: '' });
    left.appendChild(diagBox);
    pg.appendChild(left);

    var out = new Output({ lang: lang, page: pageOriginal != null, stdin: wantsStdin, stdinValue: (get('data-input') || '').replace(/\\n/g, '\n'), height: +get('data-height') || 0 });
    pg.appendChild(out.view);
    wrap.appendChild(pg);
    var hint = get('data-hint') || (lang === 'cpp'
      ? 'Press Run to compile and run your code online. C++ needs an internet connection.'
      : (autoRun ? 'Change the code. It runs again by itself when you stop typing, or press Run.' : 'Press Run, then type your answers in the output box.'));
    wrap.appendChild(el('p', { class: 'bench-hint' }, esc(hint)));

    var checkTimer, fileName = '/r' + api.nextId() + '.ts';
    function check() {
      if (lang !== 'typescript') return;
      var svc = tsService();
      if (!svc) return;
      showTSDiagnostics(svc.check(fileName, files[0].code), active === 0 ? editor : { setMarks: function () {} }, diagBox);
    }
    var ready = false;
    function select(i) {
      active = i;
      tabs.querySelectorAll('.pg-tab').forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
      editor.set(files[i].code, files[i].lang);
      editor.setMarks([]);
      if (ready && i === 0 && lang === 'typescript') check();
    }
    function run(auto) {
      clearTimeout(idle);
      auto = auto === true;
      var code = files[0].code;
      if (lang === 'python') return runPython(code, out, active === 0 ? editor : null, auto);
      if (lang === 'typescript') { check(); return runTS(code, out, editor, files[1] ? files[1].code : null); }
      if (lang === 'cpp') return runCpp(code, out, active === 0 ? editor : null, expected, original);
    }
    runBtn.addEventListener('click', function () { run(false); });
    editor.ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(false); } });
    reset.addEventListener('click', function () {
      files[0].code = original;
      if (files[1]) files[1].code = pageOriginal;
      select(active);
      out.clear();
      if (lang === 'cpp') showSaved(); else if (autoRun) run(false); else out.setStatus('idle', 'Ready');
    });
    copy.addEventListener('click', function () { api.copyText(files[active].code, copy); });

    function showSaved() {
      out.setStatus('idle', 'Saved result');
      if (expected != null) {
        out.note('This is what the program printed when it was last run. Press <b>Run</b> to compile and run it yourself.', 'quiet');
        out.write(expected);
      } else {
        out.note('Press <b>Run</b> to compile and run this program.', 'quiet');
      }
    }

    if (host) host.parentNode.replaceChild(wrap, host);
    select(0);
    ready = true;
    if (lang === 'cpp') showSaved();
    else if (autoRun) { out.setStatus('idle', 'Ready'); whenVisible(wrap, function () { run(true); }); }
    else out.note('This program asks you questions. Press <b>Run</b>, then type your answers here.', 'quiet');
    if (lang === 'typescript') whenVisible(wrap, check);
    return { wrap: wrap, run: run, editor: editor, out: out };
  }

  /* ============================================================
     Code explorer: sliders that change the program
     ============================================================ */
  function makeCodeExplorer(host) {
    var lang = host.getAttribute('data-lang') || 'python';
    var tplScript = host.querySelector('script[type="text/plain"]');
    var tpl = dedent(tplScript.textContent);
    var inputs = Array.prototype.slice.call(host.querySelectorAll('input, select'));
    var n = api.nextId();
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
      var id = 'cx' + n + '-' + name;
      inp.id = id;
      var isCheck = inp.type === 'checkbox';
      var ctl = el('div', { class: 'ctl' + (isCheck ? ' check' : '') });
      var lab = el('label', { for: id });
      var nm = el('span', { class: 'ctl-name', text: inp.getAttribute('data-label') || name });
      if (isCheck) { lab.appendChild(inp); lab.appendChild(nm); ctl.appendChild(lab); }
      else {
        var o = el('output', { for: id });
        outputs[name] = o;
        lab.appendChild(nm); lab.appendChild(o);
        ctl.appendChild(lab); ctl.appendChild(inp);
      }
      controls.appendChild(ctl);
      inp.addEventListener('input', update);
      inp.addEventListener('change', update);
    });
    ex.appendChild(controls);
    var body = el('div', { class: 'ex-body' });
    var pre = el('pre', { class: 'ex-code' });
    body.appendChild(pre);
    var out = new Output({ lang: lang, stdin: false });
    var runBtn = null;
    if (lang === 'cpp') {
      runBtn = el('button', { class: 'run-btn', type: 'button' }, '<span aria-hidden="true">▶</span> Run');
      out.view.querySelector('.pg-actions').insertBefore(runBtn, out.view.querySelector('.pg-actions').firstChild);
    }
    body.appendChild(out.view);
    ex.appendChild(body);
    var foot = el('div', { class: 'ex-foot' });
    var openBtn = el('button', { class: 'mini-btn', type: 'button' }, 'Edit this code yourself');
    foot.appendChild(openBtn);
    ex.appendChild(foot);
    wrap.appendChild(ex);
    host.parentNode.replaceChild(wrap, host);

    var last = {}, timer;
    function values() {
      var v = {};
      inputs.forEach(function (inp) {
        var name = inp.getAttribute('name');
        if (inp.type === 'checkbox') v[name] = inp.checked ? (inp.getAttribute('data-on') || 'True') : (inp.getAttribute('data-off') || 'False');
        else v[name] = inp.value + (inp.getAttribute('data-unit') || '');
      });
      return v;
    }
    function fill(v, marks) { return tpl.replace(/\{\{(\w+)\}\}/g, function (m, k) { return marks ? '\u0001' + k + '\u0002' : (v[k] != null ? v[k] : ''); }); }
    function paint() {
      var v = values();
      inputs.forEach(function (inp) { var nm = inp.getAttribute('name'); if (outputs[nm]) outputs[nm].textContent = v[nm]; });
      pre.innerHTML = api.highlight(fill(v, true), lang).replace(/\u0001(\w+)\u0002/g, function (m, k) {
        return '<mark class="live' + (last[k] !== v[k] ? ' flash' : '') + '">' + esc(v[k] != null ? v[k] : '') + '</mark>';
      });
      last = v;
      return fill(v, false);
    }
    function run() {
      var code = paint();
      if (lang === 'python') runPython(code, out, null, true);
      else if (lang === 'typescript') runTS(code, out, null, null);
      else runCpp(code, out, null, null, null);
    }
    function update() {
      paint();
      clearTimeout(timer);
      if (lang !== 'cpp') timer = setTimeout(run, 250);
      else out.setStatus('idle', 'Press Run');
    }
    if (runBtn) runBtn.addEventListener('click', run);
    openBtn.addEventListener('click', function () {
      var holder = el('div');
      wrap.parentNode.insertBefore(holder, wrap.nextSibling);
      var r = makeRunner(null, { lang: lang, code: paint(), title: 'Your copy of the explorer code', kind: 'Try it' });
      holder.parentNode.replaceChild(r.wrap, holder);
      openBtn.disabled = true;
      openBtn.textContent = 'Opened below';
    });
    paint();
    if (lang !== 'cpp') whenVisible(wrap, run);
    else { out.setStatus('idle', 'Press Run'); out.note('Move the controls, then press <b>Run</b> to compile and run the program online.', 'quiet'); }
  }

  /* ============================================================
     Stepper: watch a program run one line at a time
     Markup: a div.stepper (data-lang, data-title) holding two script tags:
       type="text/plain"        the program
       type="application/json"  the steps: [{"line":1,"vars":{"x":"5"},"out":"","note":"..."}]
     ============================================================ */
  function makeStepper(host) {
    var lang = host.getAttribute('data-lang') || 'python';
    var code = dedent(host.querySelector('script[type="text/plain"]').textContent);
    var steps = JSON.parse(host.querySelector('script[type="application/json"]').textContent);
    var lines = code.split('\n');
    var wrap = el('div', { class: 'bench step-host' });
    var t = el('div', { class: 'bench-title' });
    t.appendChild(el('span', { class: 'kind', text: 'Step through' }));
    t.appendChild(el('strong', { text: host.getAttribute('data-title') || 'Watch it run' }));
    wrap.appendChild(t);
    var box = el('div', { class: 'stepper-box' });
    var codeEl = el('div', { class: 'step-code', role: 'list' });
    lines.forEach(function (ln, i) {
      var row = el('div', { class: 'step-line', role: 'listitem' });
      row.innerHTML = '<span class="ln">' + (i + 1) + '</span><span class="lc">' + (api.highlight(ln, lang) || ' ') + '</span>';
      codeEl.appendChild(row);
    });
    box.appendChild(codeEl);
    var side = el('div', { class: 'step-side' });
    var note = el('div', { class: 'step-note', 'aria-live': 'polite' });
    var varsTitle = el('div', { class: 'step-label', text: 'Variables (the computer\'s memory)' });
    var vars = el('div', { class: 'step-vars' });
    var outTitle = el('div', { class: 'step-label', text: 'Output' });
    var outEl = el('pre', { class: 'step-out' });
    side.appendChild(note); side.appendChild(varsTitle); side.appendChild(vars); side.appendChild(outTitle); side.appendChild(outEl);
    box.appendChild(side);
    var ctrls = el('div', { class: 'step-ctrls' });
    var back = el('button', { class: 'mini-btn', type: 'button' }, '◀ Back');
    var next = el('button', { class: 'run-btn', type: 'button' }, 'Next step ▶');
    var play = el('button', { class: 'mini-btn', type: 'button' }, 'Play');
    var restart = el('button', { class: 'mini-btn', type: 'button' }, 'Restart');
    var count = el('span', { class: 'step-count' });
    ctrls.appendChild(back); ctrls.appendChild(next); ctrls.appendChild(play); ctrls.appendChild(restart); ctrls.appendChild(count);
    wrap.appendChild(box);
    wrap.appendChild(ctrls);
    host.parentNode.replaceChild(wrap, host);

    var i = 0, timer = null, prevVars = {};
    function render() {
      var s = steps[i];
      codeEl.querySelectorAll('.step-line').forEach(function (row, k) {
        row.classList.toggle('current', k + 1 === s.line);
        row.classList.toggle('done-line', false);
      });
      var cur = codeEl.children[s.line - 1];
      if (cur && cur.scrollIntoView && codeEl.scrollHeight > codeEl.clientHeight) codeEl.scrollTop = cur.offsetTop - codeEl.clientHeight / 2;
      note.innerHTML = s.note ? s.note : '';
      var v = s.vars || {};
      var keys = Object.keys(v);
      vars.innerHTML = keys.length ? '' : '<span class="step-empty">Nothing stored yet</span>';
      keys.forEach(function (k) {
        var changed = prevVars[k] !== v[k];
        var b = el('div', { class: 'var-box' + (changed ? ' changed' : '') });
        b.innerHTML = '<span class="var-name">' + esc(k) + '</span><span class="var-val">' + esc(v[k]) + '</span>';
        vars.appendChild(b);
      });
      var o = '';
      for (var k = 0; k <= i; k++) o += steps[k].out || '';
      outEl.textContent = o;
      count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      back.disabled = i === 0;
      next.disabled = i === steps.length - 1;
    }
    function go(to) {
      prevVars = (steps[i] && steps[i].vars) || {};
      if (to < i) prevVars = (steps[to - 1] && steps[to - 1].vars) || {};
      i = Math.max(0, Math.min(steps.length - 1, to));
      render();
    }
    function stopPlay() { clearInterval(timer); timer = null; play.textContent = 'Play'; }
    back.addEventListener('click', function () { stopPlay(); go(i - 1); });
    next.addEventListener('click', function () { stopPlay(); go(i + 1); });
    restart.addEventListener('click', function () { stopPlay(); prevVars = {}; i = 0; render(); });
    play.addEventListener('click', function () {
      if (timer) { stopPlay(); return; }
      if (i === steps.length - 1) { prevVars = {}; i = 0; render(); }
      play.textContent = 'Pause';
      timer = setInterval(function () { if (i >= steps.length - 1) { stopPlay(); return; } go(i + 1); }, 1100);
    });
    render();
  }

  api.registerComponent('.runnable', function (h) { makeRunner(h); });
  api.registerComponent('.code-explorer', makeCodeExplorer);
  api.registerComponent('.stepper', makeStepper);
});
