/*
  Hello HTML: the whole course as one motion-graphics video.
  Built with video/engine.js; rendered with:  node video/render.js html-course
*/
(function () {
  const { Video } = window.HelloVideo;
  const V = new Video(document.getElementById('stage'), { name: 'Hello HTML', logo: '&lt;/&gt;' });
  window.VIDEO = V;
  const GROUP = { basics: 'HTML basics', style: 'Styling with CSS', parts: 'Building blocks', layout: 'Layout & pages', polish: 'Polish', build: 'Build' };
  const lesson = (n, title, group, chip, learn, fn) => V.lesson({ n, title, group, groupName: GROUP[group], chip, learn }, fn);
  const SKELETON = (title, body) => '<!DOCTYPE html>\n<html>\n  <head>\n    <title>' + title + '</title>\n  </head>\n  <body>\n' + body + '\n  </body>\n</html>';

  /* ============================== Intro ============================== */
  V.part({ group: 'basics' }, L => {
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:30px">
        <div data-pop data-at="0.2" class="logo-mark" style="width:190px;height:190px;border-radius:56px;font-size:70px">&lt;/&gt;</div>
        <div data-pop data-at="0.7" class="big-title" style="font-size:176px">Hello <em>HTML</em></div>
        <div data-pop data-at="1.2" class="sub">Build websites from zero. The whole course in one video.</div>
      </div></div>`, { dur: 5 });

    const b = L.bench({});
    b.type('<div class="card">\n  <h1>Hi, I\'m Sam 👋</h1>\n  <p>I\'m learning to build websites.</p>\n  <button>Say hello</button>\n</div>', { cps: 24, say: 'This is *HTML*. You type code on the left...' });
    L.say('...and the browser turns it into a website on the right. Live, as you type!');
    b.paste('<style>\n  body {\n    font-family: system-ui;\n    background: #FFF4E8;\n  }\n  .card {\n    background: white;\n    padding: 28px;\n    border-radius: 24px;\n    text-align: center;\n  }\n  button {\n    background: #FF6B8B;\n    color: white;\n    border: none;\n    padding: 12px 24px;\n    border-radius: 999px;\n  }\n</style>\n\n', { at: 0, say: 'Then *CSS* makes it beautiful: colors, round corners, spacing.' });
    b.type('#4F7CFF', { replace: '#FF6B8B', say: 'Change one word, and the website changes. That is how this whole course works.' });

    const chips = [['00', 'Start Here'], ['01', 'First Page'], ['02', 'Text & Lists'], ['03', 'Links & Images'], ['04', 'Colors'], ['05', 'Classes & Divs'], ['06', 'Fonts'], ['07', 'Sizes'], ['08', 'Box Model'],
      ['09', 'Buttons'], ['10', 'Forms'], ['11', 'Flexbox'], ['12', 'Grid'], ['13', 'Pages'], ['14', 'Beautiful'], ['15', 'Phones'], ['16', 'Final Project']];
    const colors = ['tag', 'tag', 'tag', 'tag', 'prop', 'prop', 'prop', 'prop', 'prop', 'attr', 'attr', 'val', 'val', 'val', 'sel', 'sel', 'tag'];
    L.html(`<div style="position:absolute;left:150px;right:150px;top:150px;display:grid;grid-template-columns:repeat(6,1fr);gap:22px">` +
      chips.map((c, i) => `<div data-pop data-at="${(0.3 + i * 0.13).toFixed(2)}" style="background:#fff;border:2px solid var(--line);border-radius:26px;padding:22px 24px;box-shadow:0 10px 30px rgba(27,25,48,.06)">
        <div style="font-family:var(--font-code);font-size:24px;color:var(--c-${colors[i]})">${c[0]}</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:33px;letter-spacing:-.01em;margin-top:6px">${c[1]}</div></div>`).join('') + `</div>`);
    L.say('*17 short lessons*. Each one gives you a new superpower. At the end, you build a real website.', { pause: 0.8 });
  });

  /* ============================== 00 Start Here ============================== */
  lesson('00', 'Start Here', 'basics', 'hello', ['What a website is', 'The 3 languages of the web', 'Making your first file'], L => {
    const b = L.bench({});
    b.type('<h1>My first website</h1>\n<p>I made this myself!</p>', { say: 'A website is just a *text file*. You write your words, with little labels around them.' });
    b.callout({ site: 'h1' }, 'The browser draws it', { side: 'bottom', say: 'A web browser, like Safari, reads that file and draws the page you see.' });

    L.cards([
      { ic: '&lt;/&gt;', title: 'HTML', text: 'The <b>content</b>: words, pictures, buttons. Like a skeleton.', color: 'var(--c-tag)', say: '*HTML* is the content: the words, pictures and buttons. Like the skeleton of a body.' },
      { ic: '{ }', title: 'CSS', text: 'The <b>style</b>: colors, fonts, sizes and layout. Like clothes.', color: 'var(--c-prop)', say: '*CSS* is the style: colors, fonts, sizes and layout. Like clothes.' },
      { ic: 'JS', title: 'JavaScript', text: 'The <b>actions</b>: what happens when you click.', color: 'var(--c-attr)', say: '*JavaScript* makes things happen when you click. This course teaches HTML and CSS.' }
    ], { gap: 4.6, hold: 1.2 });

    L.html(`<div style="position:absolute;left:260px;right:260px;top:150px;display:grid;gap:26px">
      ${[['1', 'Open a code editor', 'like VS Code, or any plain text app'], ['2', 'Save the file as <code>index.html</code>', 'the <code>.html</code> ending makes it a web page'], ['3', 'Double-click the file', 'it opens in your web browser: your website!']].map(r =>
        `<div data-pop style="display:flex;gap:34px;align-items:center;background:#fff;border:2px solid var(--line);border-radius:34px;padding:26px 40px;box-shadow:0 14px 40px rgba(27,25,48,.07)">
          <div style="flex:none;width:96px;height:96px;border-radius:28px;background:var(--g);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:54px">${r[0]}</div>
          <div><div style="font-family:var(--font-display);font-weight:800;font-size:50px;letter-spacing:-.02em" class="sub-h">${r[1]}</div><div style="font-size:31px;color:var(--ink-2);margin-top:4px">${r[2]}</div></div></div>`).join('')}
      </div>`, { gap: 1.4 });
    L.say('On a computer, making a website takes three steps: write the file, save it as *index.html*, and open it.', { pause: 0.6 });
    L.remember([
      'A web page is a text file whose name ends in `.html`.',
      '*HTML* is the content, *CSS* is the style, *JavaScript* is the actions.',
      'The browser reads the file and draws the page.'
    ]);
  });

  /* ============================== 01 Your First Web Page ============================== */
  lesson('01', 'Your First Web Page', 'basics', '<html>', ['Tags and elements', 'Attributes', 'Tags inside tags', 'The page skeleton', 'Comments'], L => {
    const b = L.bench({});
    b.type('<p>Hello, world!</p>', { cps: 14, pause: 0.2 });
    const t = L.t;
    b.callout({ code: '<p>' }, 'opening tag', { side: 'top', dur: 8, wait: false });
    b.callout({ code: 'Hello, world!' }, 'content', { side: 'bottom', delay: 1.4, dur: 6.6, wait: false, color: 'var(--c-val)' });
    b.callout({ code: '</p>' }, 'closing tag: has a /', { side: 'top', delay: 2.8, dur: 5.2, wait: false, dist: 150 });
    L.say('Content goes between an *opening tag* and a *closing tag*. The closing one has a slash.', { dur: 4.2 });
    L.say('The tags and the content together are called an *element*.', { dur: 3.6 });
    b.type('\n<h1>I am a big heading</h1>\n<p>I am a paragraph.</p>', { say: 'Every tag has a job. *h1* is a big heading. *p* is a paragraph.' });

    b.set({ 'index.html': '<h1>Meet my cat</h1>\n' });
    b.type('<img src="images/cat.svg" width="200">', { say: 'Some tags need extra information, called *attributes*.' });
    b.callout({ code: 'src' }, 'attribute name', { side: 'top', dur: 6.2, wait: false, color: 'var(--c-attr)' });
    b.callout({ code: '"images/cat.svg"' }, 'its value, in quotes', { side: 'bottom', delay: 1.2, dur: 5, wait: false, color: 'var(--c-val)' });
    L.say('An attribute is a *name*, an equals sign, and a *value* in quotes. *src* says which picture to show.', { dur: 6.4 });
    b.type('360', { replace: '200', say: 'Change the *width* value, and the picture grows. Attributes are like settings.' });

    b.set({ 'index.html': '' });
    b.type('<p>I <strong>love</strong> my cat.</p>', { say: 'Tags can go *inside* other tags. *strong* makes words bold.' });
    b.callout({ code: '<strong>love</strong>' }, 'inside the p', { side: 'bottom', say: 'Close the inside tag first, like little boxes inside a big box.' });

    b.set({ 'index.html': '' });
    b.paste(SKELETON('My page', '    <h1>Hello!</h1>'), { say: 'Every real web page has the same *skeleton*.' });
    b.callout({ code: '<head>' }, 'info about the page', { side: 'right', dur: 4.6, wait: false, dist: 40 });
    b.callout({ node: () => b.addrTitle }, 'the title shows here', { side: 'bottom', delay: 1.6, dur: 3, wait: false, dist: 50 });
    L.say('The *head* holds information about the page, like its *title*.', { dur: 4.8 });
    b.callout({ code: '<body>' }, 'everything you see', { side: 'right', dist: 40, say: 'The *body* holds everything you can see on the page.' });
    b.type('\n    <!-- a note just for me -->', { after: '<h1>Hello!</h1>', say: '*Comments* are notes for you. The browser skips them, so they never show.' });
    L.remember([
      'Tags come in pairs: `<p>` opens and `</p>` closes.',
      'Attributes are settings: `name="value"`.',
      '`<head>` is information, `<body>` is what you see.',
      '`<!-- comments -->` are notes the browser skips.'
    ]);
  });

  /* ============================== 02 Headings, Paragraphs & Lists ============================== */
  lesson('02', 'Headings, Paragraphs & Lists', 'basics', '<h1>', ['Six sizes of headings', 'Paragraphs and new lines', 'Bold, italic, highlight', 'Bullet and numbered lists'], L => {
    const b = L.bench({});
    b.type('<h1>Heading 1</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>', { say: 'Headings go from *h1*, the biggest, down to *h6*, the smallest.' });
    L.say('Use *one h1* for the main title of the page, and h2 for each section.');
    b.type('\n<p>A paragraph is a block of text.<br>br starts a new line.</p>', { say: '*p* makes a paragraph. *br* breaks the line. It has no closing tag.' });
    b.set({ 'index.html': '' });
    b.type('<p>I am <strong>bold</strong>, <em>italic</em>\nand <mark>highlighted</mark>.</p>', { say: '*strong* makes words bold, *em* makes them italic, and *mark* highlights them.' });
    b.set({ 'index.html': '' });
    b.type('<h2>Pancakes</h2>\n<ul>\n  <li>Flour</li>\n  <li>Milk</li>\n  <li>Eggs</li>\n</ul>', { say: '*ul* makes a bullet list. Each item goes inside an *li* tag.' });
    b.type('<ol>', { replace: '<ul>', select: 0.4, pause: 0.1, cps: 12 });
    b.type('</ol>', { replace: '</ul>', select: 0.4, cps: 12, say: 'Change *ul* to *ol*, and the bullets become numbers!' });
    b.type('\n<p>5 &lt; 10 &amp; I ❤️ HTML 🎉</p>', { say: 'Some characters have codes, like `&lt;` for the < sign. Emoji just work!' });
    L.remember([
      'Headings: `<h1>` (biggest) to `<h6>` (smallest).',
      '`<p>` is a paragraph, `<br>` starts a new line.',
      '`<strong>` bold, `<em>` italic, `<mark>` highlight.',
      '`<ul>` bullets, `<ol>` numbers, `<li>` each item.'
    ]);
  });

  /* ============================== 03 Links & Images ============================== */
  lesson('03', 'Links & Images', 'basics', '<a>', ['Making links', 'Opening a new tab', 'Showing pictures', 'Which picture files to use'], L => {
    const b = L.bench({});
    b.type('<a href="https://wikipedia.org">Visit Wikipedia</a>', { say: '*a* makes a link. Its *href* attribute says where the link goes.' });
    b.callout({ code: '"https://wikipedia.org"' }, 'where it goes', { side: 'bottom', wait: false, dur: 3.2 });
    b.click('a', { hold: 2.4 });
    L.say('Click it, and the browser goes there. Links are what make the web a *web*.');
    b.type('\n   target="_blank"', { after: 'wikipedia.org"', say: 'Add *target="_blank"* to open the link in a new tab.' });
    L.say('Links can also write an email with *mailto:* or jump down the page with *#*.');

    b.set({ 'index.html': '<h1>My favorite place</h1>\n' });
    b.type('<img src="images/mountains.svg"\n     alt="Mountains at sunset"\n     width="320">', { say: '*img* shows a picture. *src* is the picture file.' });
    b.callout({ code: 'alt' }, 'describes the picture', { side: 'bottom', say: '*alt* describes the picture in words, for people who can\'t see it.' });
    b.type('180', { replace: '320', say: 'Pictures are usually too big. Set the *width*, and the height follows.' });
    L.cards([
      { ic: '📷', title: 'JPG', text: 'Photos', color: 'var(--c-prop)' },
      { ic: '🖼️', title: 'PNG', text: 'Screenshots, see-through parts', color: 'var(--c-val)' },
      { ic: '✏️', title: 'SVG', text: 'Logos and drawings: sharp at any size', color: 'var(--c-sel)' },
      { ic: '🎞️', title: 'GIF', text: 'Small animations', color: 'var(--c-attr)' }
    ], { gap: 0.6, hold: 0 });
    L.say('Use *JPG* for photos, *PNG* for screenshots, *SVG* for logos and drawings, and *GIF* for little animations.', { pause: 0.8 });
    L.remember([
      '`<a href="page.html">text</a>` makes a link.',
      '`target="_blank"` opens it in a new tab.',
      '`<img src="cat.jpg" alt="A cat">` shows a picture.',
      'Always write `alt` text, and set a `width`.'
    ]);
  });

  /* ============================== 04 Hello CSS: Colors ============================== */
  lesson('04', 'Hello CSS: Colors', 'style', 'color:', ['What a CSS rule looks like', 'Text and background colors', 'Names, hex and RGB', 'See-through colors'], L => {
    const b = L.bench({ files: { 'index.html': '<h1>Hello, colors!</h1>\n<p>CSS paints the page.</p>' } });
    L.say('HTML says *what* is on the page. *CSS* says how it *looks*.');
    b.type('<style>\n  h1 {\n    color: tomato;\n  }\n</style>\n\n', { at: 0, say: 'CSS goes inside a *style* tag. This rule says: make every h1 tomato red.' });
    b.callout({ code: 'h1 {' }, 'selector: which things', { side: 'right', dist: 30, dur: 9, wait: false, color: 'var(--c-sel)' });
    b.callout({ code: 'color' }, 'property: what to change', { side: 'right', dist: 200, delay: 1.4, dur: 7.6, wait: false });
    b.callout({ code: 'tomato' }, 'value: how', { side: 'bottom', dist: 70, delay: 2.8, dur: 6.2, wait: false, color: 'var(--c-val)' });
    L.say('A rule has a *selector*, then *property: value;* pairs inside curly brackets.', { dur: 5 });
    L.wait(4);
    b.type('\n    background: lightyellow;', { after: 'color: tomato;', say: '*color* is the text color. *background* paints behind it.' });
    b.type('#FF6347', { replace: 'tomato', say: 'There are 140 color names, or *hex codes* like #FF6347 for any color at all.' });
    b.type('rgb(255, 99, 71)', { replace: '#FF6347', say: '*rgb* mixes red, green and blue light, each from 0 to 255.' });
    b.type('rgba(255, 99, 71, 0.2)', { replace: 'lightyellow', say: 'Add a 4th number with *rgba* to make it see-through: 0 is invisible, 1 is solid.' });
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:40px">
        <div style="display:flex;gap:24px">${['#FF6B8B', '#FFB86B', '#FFE08A', '#7FD8BE', '#4F7CFF'].map((c, i) => `<div data-pop data-at="${0.3 + i * 0.25}" style="width:220px;height:260px;border-radius:30px;background:${c};box-shadow:0 18px 40px rgba(27,25,48,.12);display:flex;align-items:flex-end;justify-content:center;padding:18px;font-family:var(--font-code);font-size:26px;color:#1B1930">${c}</div>`).join('')}</div>
        <div data-pop data-at="1.8" class="sub">Pick 2 or 3 colors, and use them everywhere.</div></div></div>`);
    L.say('Good websites use just a few colors. Free sites like *coolors.co* make palettes for you.', { pause: 0.6 });
    L.remember([
      'A rule: `selector { property: value; }`',
      '`color` is for text, `background` for behind it.',
      'Colors: names, hex `#FF6347`, or `rgb(255, 99, 71)`.',
      '`rgba(..., 0.5)` makes a color half see-through.'
    ]);
  });

  /* ============================== 05 Classes, Divs & Sections ============================== */
  lesson('05', 'Classes, Divs & Sections', 'style', '.class', ['Classes and ids', 'div and span', 'Page sections', 'Which rule wins'], L => {
    const b = L.bench({ files: { 'index.html': '<style>\n</style>\n<p>Lemon cake</p>\n<p>Chocolate cake</p>\n<p>Apple pie</p>' } });
    L.say('A rule for *p* styles every paragraph. How do you style just *one* of them?');
    b.type(' class="sale"', { before: '>Chocolate', say: 'Give it a *class*: a name you make up.' });
    b.type('  .sale {\n    color: white;\n    background: crimson;\n  }\n', { before: '</style>', say: 'In CSS, a *dot* means class. *.sale* styles only the things with that class.' });
    b.callout({ code: '.sale' }, 'dot = class', { side: 'right', dist: 140, wait: false, dur: 3.5 });
    L.say('You can use the same class on many things. An *id* (#) is for one single thing.', { dur: 4.6 });

    b.set({ 'index.html': '<style>\n  .card {\n    background: lavender;\n    padding: 16px;\n    border-radius: 16px;\n  }\n</style>\n' });
    b.type('<div class="card">\n  <h2>Lemon cake 🍋</h2>\n  <p>Sweet and fresh.</p>\n</div>', { say: 'A *div* is an invisible box that groups things together. Style the box, and you style the group.' });
    L.say('*span* is the same idea, for a few words inside a line of text.');
    L.html(`<div style="position:absolute;left:560px;top:150px;width:800px;display:grid;gap:16px;font-family:var(--font-code);font-size:34px;color:#fff;text-align:center">
        <div data-pop style="background:var(--c-tag);border-radius:22px;padding:22px">&lt;header&gt;</div>
        <div data-pop style="background:var(--c-sel);border-radius:22px;padding:16px">&lt;nav&gt;</div>
        <div data-pop style="background:var(--c-prop);border-radius:22px;padding:22px;display:grid;gap:14px">&lt;main&gt;
          <div style="background:rgba(255,255,255,.25);border-radius:16px;padding:18px">&lt;section&gt;</div>
          <div style="background:rgba(255,255,255,.25);border-radius:16px;padding:18px">&lt;section&gt;</div></div>
        <div data-pop style="background:var(--c-val);border-radius:22px;padding:22px">&lt;footer&gt;</div></div>`, { gap: 0.8 });
    L.say('Big pages are split into parts with clear names: *header*, *nav*, *main*, *section* and *footer*.', { pause: 1.2 });
    L.remember([
      '`class="name"` in HTML, `.name { }` in CSS.',
      '`id="name"` is for one thing; `#name { }` in CSS.',
      '`<div>` groups things in a box; `<span>` wraps words.',
      'Name the parts: `header`, `nav`, `main`, `section`, `footer`.'
    ]);
  });

  /* ============================== 06 Fonts & Text Style ============================== */
  lesson('06', 'Fonts & Text Style', 'style', 'font', ['Choosing a font', 'Free Google Fonts', 'Size, weight, line height', 'Alignment and spacing'], L => {
    const b = L.bench({ files: { 'index.html': '<h1>Strawberry smoothie</h1>\n<p>Blend berries, a banana and some\nmilk. Pour into a glass. Enjoy!</p>' } });
    b.type('<style>\n  body {\n    font-family: Georgia, serif;\n  }\n</style>\n', { at: 0, say: '*font-family* picks the font. After a comma, list backups in case the first is missing.' });
    b.type('"Fredoka", sans-serif', { replace: 'Georgia, serif', say: '*Google Fonts* has over 1,500 free fonts. Add its link to your page, then use the name.' });
    b.type('  h1 {\n    font-size: 48px;\n    font-weight: 700;\n    color: #E8436B;\n  }\n', { before: '</style>', say: '*font-size* sets how big. *font-weight* sets how thick: 400 is normal, 700 is bold.' });
    b.type('  p {\n    font-size: 20px;\n    line-height: 1.6;\n  }\n', { before: '</style>', say: '*line-height* adds space between lines, so text is easy to read.' });
    b.type('\n    text-align: center;', { after: 'font-family: "Fredoka", sans-serif;', say: '*text-align: center* puts every line in the middle.' });
    L.remember([
      '`font-family: "Name", backup;` picks the font.',
      '`font-size` = how big, `font-weight` = how thick.',
      '`line-height: 1.6` makes text easy to read.',
      '`text-align: center` centers lines of text.'
    ]);
  });

  /* ============================== 07 Sizes & Units ============================== */
  lesson('07', 'Sizes & Units', 'style', 'px', ['What a pixel is', 'width and height', 'px, %, rem, vw', 'max-width'], L => {
    const grid = [];
    const face = ['..XXXXXX..', '.X......X.', 'X..X..X..X', 'X........X', 'X.X....X.X', 'X..XXXX..X', '.X......X.', '..XXXXXX..'];
    face.forEach((row, y) => [...row].forEach((c, x) => grid.push(`<div data-pop data-quiet data-at="${(0.2 + (x + y) * 0.05).toFixed(2)}" style="width:54px;height:54px;border-radius:6px;background:${c === 'X' ? '#FFB800' : '#FFF3C4'}"></div>`)));
    L.html(`<div class="center"><div style="display:flex;gap:90px;align-items:center">
        <div style="display:grid;grid-template-columns:repeat(10,54px);gap:5px">${grid.join('')}</div>
        <div data-pop data-at="1.4" style="max-width:640px"><div class="big-title" style="text-align:left;font-size:96px">1 <em>px</em></div>
        <div class="sub" style="text-align:left;margin-top:16px">A pixel is one tiny dot of light on the screen. Screens have millions of them.</div></div></div></div>`);
    L.say('Sizes on the web are measured in *pixels*, written *px*. A pixel is one tiny dot on the screen.', { pause: 0.6 });

    const b = L.bench({ files: { 'index.html': '<style>\n  .box {\n    width: 300px;\n    height: 150px;\n    background: gold;\n    border-radius: 16px;\n  }\n</style>\n<div class="box"></div>' } });
    V.mark('ruler');
    b.ruler('.box', { dur: 26, wait: false });
    L.say('*width* and *height* set the size of a box. This one is 300 pixels wide.');
    b.type('480px', { replace: '300px', say: 'Make it 480px, and it grows.' });
    b.type('50%', { replace: '480px', say: '*%* means a part of the space around it. 50% is always half.' });
    b.viewport(420, { dur: 2, say: 'Make the screen smaller: the box stays half as wide as the page.' });
    b.viewport(678, { dur: 1.6 });
    L.say('*rem* is for text: 1rem is the normal text size, usually 16px. *vw* is a percent of the screen width.');
    b.type('100%;\n    max-width: 400px', { replace: '50%', say: '*max-width* means: grow, but never wider than this. Great for text and cards.' });
    b.ruler('.box', { dur: 7, wait: false });
    b.viewport(360, { dur: 2.2 });
    b.viewport(678, { dur: 2.2 });
    L.html(`<div style="position:absolute;left:300px;right:300px;top:150px;display:grid;gap:18px">
      ${[['Text', '16px to 20px', '1rem'], ['Headings', '32px to 56px', '2rem to 3.5rem'], ['Buttons', 'at least 44px tall', 'easy to tap'], ['Text column', 'max-width: 700px', 'easy to read'], ['Whole page', 'max-width: 1100px', 'centered']].map(r =>
        `<div data-pop style="display:grid;grid-template-columns:300px 1fr 300px;align-items:center;background:#fff;border:2px solid var(--line);border-radius:26px;padding:22px 34px;font-size:34px">
          <b style="font-family:var(--font-display);font-size:38px">${r[0]}</b><span style="font-family:var(--font-code);color:var(--g)">${r[1]}</span><span style="color:var(--ink-3)">${r[2]}</span></div>`).join('')}</div>`, { gap: 0.5 });
    L.say('Here is a size guide to start with. You can find it in the lesson too.', { dur: 5.5 });
    L.remember([
      '`px` = pixels, the tiny dots of the screen.',
      '`%` = part of the space around it.',
      '`rem` for text sizes, `vw` for screen width.',
      '`max-width` = grow, but never wider than this.'
    ]);
  });

  /* ============================== 08 Spacing: The Box Model ============================== */
  lesson('08', 'Spacing: The Box Model', 'style', 'padding', ['Padding, border, margin', 'Shorthand for four sides', 'Rounded corners', 'Shadows'], L => {
    const b = L.bench({ fixedZoom: 1.5, files: { 'index.html': '<style>\n  body { background: lavender; }\n  .card {\n    width: 220px;\n    font-size: 22px;\n    background: white;\n  }\n</style>\n<div class="card">I\'m a box with layers!</div>' } });
    L.say('Every element on a page is a *box*. CSS lets you add space inside it and around it.');
    b.type('\n    padding: 20px;', { after: 'background: white;', say: '*padding* is space *inside* the box, around the content.' });
    b.type('\n    border: 5px solid hotpink;', { after: 'padding: 20px;', say: '*border* is the line around the box: thickness, style, color.' });
    b.type('\n    margin: 30px;', { after: 'hotpink;', say: '*margin* is space *outside* the box. It pushes other things away.' });
    V.mark('box');
    b.box('.card', { dur: 8, step: 1.3, say: 'Content, padding, border, margin: that is the *box model*. Every element has these four layers.' });
    b.type('10px 40px', { replace: '20px', say: 'Two values: *10px 40px* means top and bottom 10px, left and right 40px.' });
    b.type('\n    border-radius: 20px;', { after: 'margin: 30px;', say: '*border-radius* rounds the corners. 50% makes a circle!' });
    b.type('\n    box-shadow: 0 10px 30px\n      rgba(0, 0, 0, 0.15);', { after: 'border-radius: 20px;', say: '*box-shadow* adds a soft shadow: across, down, blur, and color.' });
    L.remember([
      '`padding` = space inside, `margin` = space outside.',
      '`border: 2px solid pink;` draws the line.',
      '`border-radius` rounds corners; `50%` = circle.',
      '`box-shadow: 0 10px 30px rgba(0,0,0,.15);`'
    ]);
  });

  /* ============================== 09 Buttons ============================== */
  lesson('09', 'Buttons', 'parts', '<button>', ['Styling a button', 'Hover and press', 'Smooth animation', 'Button styles to copy'], L => {
    const b = L.bench({ files: { 'index.html': '' } });
    b.type('<button>Click me</button>', { say: '*button* makes a button. On its own, it looks plain and grey.' });
    b.paste('<style>\n  body { font-family: system-ui; padding: 30px; }\n  button {\n    background: #7C5CFF;\n    color: white;\n    border: none;\n    padding: 14px 28px;\n    border-radius: 999px;\n    font-size: 20px;\n  }\n</style>\n', { at: 0, say: 'A few lines of CSS, and it looks like a button from a real app.' });
    b.type('  button:hover {\n    background: #E8436B;\n    transform: scale(1.1);\n  }\n', { before: '</style>', say: '*:hover* styles the button while the mouse is on it.' });
    b.hover('button', { dur: 2.2 });
    b.type('\n    transition: all 0.3s;', { after: 'font-size: 20px;', say: '*transition* makes the change smooth instead of sudden.' });
    b.hover('button', { dur: 2.6 });
    const styles = [
      ['Solid', 'background:#7C5CFF;color:#fff'], ['Outline', 'background:#fff;color:#7C5CFF;box-shadow:inset 0 0 0 3px #7C5CFF'],
      ['Soft', 'background:#EEE8FF;color:#5B3DF5'], ['Gradient', 'background:linear-gradient(135deg,#FF6B8B,#7C5CFF);color:#fff'],
      ['Shadow', 'background:#fff;color:#1B1930;box-shadow:0 12px 26px rgba(27,25,48,.18)'], ['Dark', 'background:#1B1930;color:#fff']];
    L.html(`<div class="center"><div style="display:grid;grid-template-columns:repeat(3,auto);gap:46px 60px;justify-items:center">${styles.map(s =>
      `<div data-pop style="${s[1]};font-family:var(--font-body);font-weight:700;font-size:40px;padding:26px 56px;border-radius:999px">${s[0]}</div>`).join('')}</div></div>`, { gap: 0.35 });
    L.say('Solid, outline, soft, gradient... The lesson has *10 button styles* you can copy.', { pause: 0.6 });
    L.say('To make a link look like a button, give the *a* tag the same styles.');
    L.remember([
      '`<button>Text</button>` makes a button.',
      'Style it with `background`, `padding`, `border-radius`.',
      '`button:hover { }` = when the mouse is on it.',
      '`transition: all 0.3s;` makes changes smooth.'
    ]);
  });

  /* ============================== 10 Text Boxes & Forms ============================== */
  lesson('10', 'Text Boxes & Forms', 'parts', '<input>', ['Text boxes and labels', 'Many kinds of inputs', 'Checkboxes and dropdowns', 'A sign-up form'], L => {
    const b = L.bench({ files: { 'index.html': '<style>\n  body { font-family: system-ui; }\n  input { display: block; margin: 6px 0 14px; }\n</style>\n' } });
    b.type('<label>Your name</label>\n<input type="text" placeholder="Sam">', { say: '*input* makes a box people can type in. A *label* says what to type.' });
    b.paste('\n<input type="email" placeholder="you@mail.com">\n<input type="password" value="secret">\n<input type="date">\n<input type="color" value="#FF6B8B">\n<input type="range">', { say: 'Change the *type*, and you get a different kind of input.' });
    L.say('Email, password, date, color, a slider... There are 22 types. The lesson shows 14 of them.');
    b.paste('\n<label><input type="checkbox"> I agree</label>\n<select><option>Pizza</option></select>', { say: '*checkbox* is a tick box. *select* makes a dropdown menu.' });

    b.set({ 'index.html': '<style>\n  body { font-family: system-ui;\n    background: #FFF0F5; padding: 20px; }\n  form { background: white; padding: 24px;\n    border-radius: 20px; }\n  input { display: block; width: 100%;\n    box-sizing: border-box; padding: 12px;\n    margin: 8px 0; font-size: 16px;\n    border: 2px solid #ddd; border-radius: 12px; }\n  button { background: #E8436B; color: white;\n    border: 0; padding: 12px 24px;\n    border-radius: 12px; font-size: 16px; }\n</style>\n' });
    b.type('<form>\n  <h2>Join the club 🌸</h2>\n  <input type="text" placeholder="Name">\n  <input type="email" placeholder="Email">\n  <button>Sign up</button>\n</form>', { cps: 26, say: 'Put inputs and a button inside a *form*. When you press the button, the answers are sent.' });
    b.type('  input:focus { border-color: #E8436B; }\n', { before: '</style>', say: '*:focus* styles the box you are typing in.' });
    V.mark('focus');
    b.hover('input[type=email]', { cls: 'is-focus', dur: 2.4 });
    L.remember([
      '`<input type="text">` is a text box; `<label>` names it.',
      'Types: `email`, `password`, `date`, `color`, `checkbox`...',
      '`<textarea>` for long text, `<select>` for a dropdown.',
      'A `<form>` sends the answers when you press its button.'
    ]);
  });

  /* ============================== 11 Layout with Flexbox ============================== */
  lesson('11', 'Layout with Flexbox', 'layout', 'flex', ['Side by side with one line', 'Spacing things out', 'Centering anything', 'Navigation bars'], L => {
    const b = L.bench({ files: { 'index.html': '<style>\n  .row {\n    background: #E3F7EE;\n  }\n  .row div {\n    background: white;\n    padding: 18px;\n    margin: 6px;\n    font-size: 32px;\n  }\n</style>\n<div class="row">\n  <div>🍎</div>\n  <div>🍌</div>\n  <div>🍒</div>\n</div>' } });
    L.say('Boxes normally stack on top of each other. What if you want them *side by side*?');
    b.type('\n    display: flex;', { after: 'background: #E3F7EE;', say: 'One line: *display: flex*. Now the boxes sit side by side!' });
    b.type('\n    justify-content: center;', { after: 'display: flex;', say: '*justify-content* moves them along the row: to the center...' });
    b.type('space-between', { replace: 'center', say: '...or spread out, with all the space *between* them.' });
    b.type('\n    height: 220px;\n    align-items: center;', { after: 'space-between;', say: '*align-items* lines them up the other way: top, center or bottom.' });
    b.type('center', { replace: 'space-between', say: 'Center and center: the classic way to put anything in the *middle*.' });
    b.set({ 'index.html': '<style>\n  body { margin: 0; font-family: system-ui; }\n  nav {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    background: #1B1930;\n    padding: 16px 22px;\n  }\n  nav a { color: white; margin-left: 18px; }\n  .logo { color: gold; font-weight: bold; }\n</style>\n<nav>\n  <span class="logo">🌼 Bloom</span>\n  <div>\n    <a href="#">Home</a>\n    <a href="#">About</a>\n  </div>\n</nav>' });
    L.say('A navigation bar is flexbox too: the logo on the left, the links on the right.');
    b.callout({ site: 'nav' }, 'display: flex + space-between', { side: 'bottom', dist: 60 });
    L.remember([
      '`display: flex;` puts children side by side.',
      '`justify-content`: center, space-between, ...',
      '`align-items: center;` lines them up across.',
      '`gap: 16px;` adds space between the items.'
    ]);
  });

  /* ============================== 12 Layout with Grid ============================== */
  lesson('12', 'Layout with Grid', 'layout', 'grid', ['Making columns', 'The fr unit', 'Grids that fit any screen', 'Big tiles'], L => {
    const b = L.bench({ files: { 'index.html': '<style>\n  .grid {\n    display: grid;\n    gap: 12px;\n  }\n  .grid div {\n    background: #C9F2DF;\n    padding: 26px;\n    border-radius: 14px;\n    text-align: center;\n  }\n</style>\n<div class="grid">\n  <div>1</div><div>2</div><div>3</div>\n  <div>4</div><div>5</div><div>6</div>\n</div>' } });
    L.say('*Grid* is for rows *and* columns: photo galleries, cards, whole pages.');
    b.type('\n    grid-template-columns: 1fr 1fr 1fr;', { after: 'display: grid;', say: '*grid-template-columns* makes the columns. Three times *1fr* = three equal columns.' });
    b.callout({ code: '1fr' }, '1 fr = one share', { side: 'bottom', dist: 60, say: '*fr* means one share of the space. Every 1fr column gets the same share.' });
    b.type('2fr 1fr', { replace: '1fr 1fr 1fr', say: '*2fr 1fr*: the first column gets two shares, the second one.' });
    b.type('\n      repeat(auto-fill, minmax(140px, 1fr))', { replace: ' 2fr 1fr', say: 'This magic line makes as many columns as fit, each at least 140px wide.' });
    b.viewport(360, { dur: 2.4, say: 'Make the screen smaller, and the grid rearranges itself. No extra work!' });
    b.viewport(680, { dur: 2 });
    b.type(' class="big"', { before: '>1</div>', pause: 0.1 });
    V.mark('span');
    b.type('  .big { grid-column: span 2; }\n', { before: '</style>', say: '*span 2* makes a tile two columns wide.' });
    L.cards([
      { ic: '↔', title: 'Flexbox', text: 'One row of things: menus, buttons, a row of icons.', color: 'var(--c-val)' },
      { ic: '▦', title: 'Grid', text: 'Rows and columns: galleries, cards, whole pages.', color: 'var(--c-prop)' }
    ], { gap: 0.8, hold: 0 });
    L.say('*Flexbox* for one row of things. *Grid* for rows and columns. Real websites use both.', { pause: 0.8 });
    L.remember([
      '`display: grid;` with `grid-template-columns`.',
      '`1fr 1fr 1fr` = three equal columns.',
      '`repeat(auto-fill, minmax(140px, 1fr))` fits any screen.',
      '`grid-column: span 2;` makes a big tile.'
    ]);
  });

  /* ============================== 13 Multiple Pages ============================== */
  lesson('13', 'Multiple Pages', 'layout', 'href', ['A website is a folder', 'Linking pages together', 'One CSS file for all pages', 'Putting it online'], L => {
    const row = (icon, name, note, indent, at) => `<div data-pop data-at="${at}" style="display:flex;align-items:center;gap:22px;margin-left:${indent}px;font-family:var(--font-code);font-size:40px">
      <span style="font-size:46px">${icon}</span><b style="font-weight:500">${name}</b><span style="font-family:var(--font-body);font-size:30px;color:var(--ink-3)">${note}</span></div>`;
    L.html(`<div style="position:absolute;left:420px;top:170px;display:grid;gap:22px;background:#fff;border:2px solid var(--line);border-radius:36px;padding:44px 60px;box-shadow:0 20px 60px rgba(27,25,48,.08)">
      ${row('📁', 'my-site/', '', 0, 0.2)}${row('📄', 'index.html', '← the home page', 60, 0.8)}${row('📄', 'about.html', '← another page', 60, 1.3)}${row('🎨', 'style.css', '← the look of every page', 60, 1.8)}${row('📁', 'images/', '', 60, 2.3)}${row('🖼️', 'cat.svg', '', 120, 2.7)}</div>`);
    L.say('A website is a *folder* of files. *index.html* is always the home page.', { pause: 0.8 });
    const nav = '<link rel="stylesheet" href="style.css">\n<nav>\n  <a href="index.html">Home</a>\n  <a href="about.html">About</a>\n</nav>\n';
    const b = L.bench({ files: {
      'index.html': nav + '<h1>Welcome home!</h1>',
      'about.html': nav + '<h1>About me</h1>\n<p>I love cats and code.</p>',
      'style.css': 'body {\n  font-family: system-ui;\n  background: #FFF8F0;\n}\nnav a {\n  margin-right: 14px;\n}' } });
    b.callout({ code: 'href="about.html"' }, 'the name of the other file', { side: 'bottom', dist: 60, say: 'To link two pages, use *a href* with the name of the other file.' });
    b.click('a[href="about.html"]', { hold: 1.4 });
    b.go('about.html', { say: 'Click it, and the browser opens *about.html*. Same menu, new page.' });
    b.tab('style.css', { say: 'Both pages link to one *style.css* file.' });
    b.type('#E8F4FF', { replace: '#FFF8F0', say: 'Change the style file once, and *every* page changes.' });
    L.cards([
      { ic: '📄', title: 'about.html', text: 'A file in the same folder', color: 'var(--c-val)' },
      { ic: '📁', title: 'images/cat.svg', text: 'Go into a folder', color: 'var(--c-prop)' },
      { ic: '⬆', title: '../index.html', text: 'Go up one folder', color: 'var(--c-attr)' }
    ], { gap: 0.6, hold: 0 });
    L.say('These names are called *paths*. They tell the browser where to find a file.', { dur: 4.4 });
    L.say('To put your folder online for free, you can use *GitHub Pages* or *Netlify*.', { pause: 0.6 });
    L.remember([
      'A website is a folder; `index.html` is the home page.',
      '`<a href="about.html">` links to another page.',
      '`<link rel="stylesheet" href="style.css">` on every page.',
      '`images/cat.svg` = inside the images folder.'
    ]);
  });

  /* ============================== 14 Make It Beautiful ============================== */
  lesson('14', 'Make It Beautiful', 'polish', 'shadow', ['Room to breathe', 'Color variables', 'Gradients', 'Hover effects and animation'], L => {
    const tips = ['Room to breathe', 'Color variables', 'Gradients', 'Hover effects', 'Animation', 'Frosted glass', 'Little details'];
    L.html(`<div class="center"><div style="display:flex;flex-wrap:wrap;gap:22px;justify-content:center;max-width:1400px">${tips.map((t, i) =>
      `<div data-pop style="font-family:var(--font-display);font-weight:800;font-size:46px;padding:24px 40px;border-radius:999px;background:#fff;border:2px solid var(--line)"><span style="color:var(--g)">${i + 1}.</span> ${t}</div>`).join('')}</div></div>`, { gap: 0.4 });
    L.say('Seven simple ingredients turn a plain page into a polished, fun one.', { pause: 0.8 });
    const b = L.bench({ files: { 'index.html': '<style>\n  body { font-family: system-ui; padding: 34px; }\n  .card {\n    background: white;\n    padding: 30px;\n    border-radius: 24px;\n    box-shadow: 0 20px 40px\n      rgba(0, 0, 0, 0.15);\n  }\n  h2 { color: #FF6B8B; }\n</style>\n<div class="card">\n  <h2>Weekend getaway 🏝️</h2>\n  <p>Sun, sea and good books.</p>\n</div>' } });
    b.type('  :root { --main: #FF6B8B; }\n', { after: '<style>\n', say: 'A *variable* stores a color with a name, like *--main*.' });
    b.type('var(--main)', { replace: '#FF6B8B; }', from: 'h2', pause: 0.1 });
    b.type('; }', { after: 'color: var(--main)', say: 'Use it with *var(--main)*. Change the variable once, and every place that uses it changes.' });
    b.type('#7C5CFF', { replace: '#FF6B8B', say: 'Purple now. One small change!' });
    b.paste('\n    background: linear-gradient(135deg,\n      #FFD3A5, #FD6585);', { after: 'padding: 34px;', say: '*linear-gradient* blends colors smoothly. Gradients look modern and fun.' });
    b.type('  @keyframes float {\n    50% { transform: translateY(-14px); }\n  }\n  .card { animation: float 3s infinite; }\n', { before: '</style>', cps: 24, say: '*@keyframes* makes an animation that plays by itself. This card floats up and down.' });
    L.wait(2.5);
    L.remember([
      'Give everything room: generous `padding` and `margin`.',
      'Color variables: `--main: pink;` then `var(--main)`.',
      '`linear-gradient(135deg, peach, pink)` for backgrounds.',
      '`:hover`, `transition` and `@keyframes` add life.'
    ]);
  });

  /* ============================== 15 Phones & Tablets ============================== */
  lesson('15', 'Phones & Tablets', 'polish', '@media', ['The viewport tag', 'Layouts that stretch', 'Media queries', 'Testing on a phone size'], L => {
    L.big('Most people visit websites on a <em>phone</em>.', 'Your site needs to look good on small screens and big ones.', { dur: 4.2 });
    const b = L.bench({ viewport: 1000, readout: true, files: { 'index.html': '<style>\n  body { font-family: system-ui; padding: 20px;\n    background: #FFF8F0; }\n  .features {\n    display: grid;\n    grid-template-columns: 1fr 1fr 1fr;\n    gap: 16px;\n  }\n  .card { background: white; padding: 24px;\n    border-radius: 18px; font-size: 20px; }\n  h1 { font-size: 44px; }\n</style>\n<h1>Why you\'ll love it</h1>\n<div class="features">\n  <div class="card">☁️ Light as a cloud</div>\n  <div class="card">🔋 Lasts a week</div>\n  <div class="card">💧 Rain? No problem</div>\n</div>' } });
    L.say('Here is a page on a laptop screen, 1000 pixels wide: three columns.');
    b.viewport(375, { dur: 2.6, say: 'Now on a phone, 375 pixels wide. Squished! The columns are too narrow.' });
    b.viewport(1000, { dur: 1.6 });
    b.type('  @media (max-width: 600px) {\n    .features {\n      grid-template-columns: 1fr;\n    }\n    h1 { font-size: 30px; }\n  }\n', { before: '</style>', cps: 24, say: 'A *media query* adds rules for small screens only: below 600px, use one column.' });
    V.mark('media');
    b.viewport(375, { dur: 3, say: 'Watch: when the screen gets narrower than 600px, the layout switches to one column.' });
    b.viewport(1000, { dur: 2.2 });
    L.say('Step 1 is one line in the head: the *viewport* tag. It tells phones to show the page at the right size.');
    L.remember([
      'Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
      'Use `%`, `fr` and `max-width` so layouts can stretch.',
      '`@media (max-width: 600px) { ... }` = rules for phones.',
      'Test by making your browser window narrow.'
    ]);
  });

  /* ============================== 16 Final Project ============================== */
  lesson('16', 'Final Project', 'build', 'launch', ['Planning a website', 'Building it step by step', 'Making it work on phones', 'Making it yours'], L => {
    const F = window.VIDEO_FILES;
    const b = L.bench({ layout: 'site', fixedZoom: 1.25, files: { 'index.html': F['index.html'], 'about.html': F['about.html'], 'style.css': F['style.css'] } });
    L.say('In the final project, you build *Daybloom*: a complete website for a calm little planner app.');
    b.scroll(700, { dur: 4, say: 'A navigation bar, a big welcome, feature tiles, a quote and a sign-up form. Everything from the course!' });
    b.scroll(1500, { dur: 4 });
    b.scroll(0, { dur: 2.2 });
    b.go('about.html', { say: 'It has two pages that share one style.css file: the home page and an about page.' });
    b.scroll(500, { dur: 3 });
    const steps = ['Plan before you code', 'The skeleton and the fonts', 'Variables and basics', 'The navigation bar', 'The hero', 'The feature tiles', 'The quote and the sign-up form', 'Phones and tablets'];
    L.html(`<div style="position:absolute;left:250px;right:250px;top:150px;display:grid;grid-template-columns:1fr 1fr;gap:22px">${steps.map((s, i) =>
      `<div data-pop style="display:flex;gap:24px;align-items:center;background:#fff;border:2px solid var(--line);border-radius:28px;padding:22px 28px">
        <span style="flex:none;width:70px;height:70px;border-radius:22px;background:var(--ink);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:38px">${i + 1}</span>
        <span style="font-family:var(--font-display);font-weight:800;font-size:38px;letter-spacing:-.01em">${s}</span></div>`).join('')}</div>`, { gap: 0.45 });
    L.say('You build it in 8 small steps, one section at a time, with the code for every step.', { pause: 1 });
    const p = L.bench({ layout: 'site', viewport: 1100, readout: true, files: { 'index.html': F['index.html'], 'style.css': F['style.css'] } });
    p.viewport(390, { dur: 3, say: 'And it works on every screen: laptop, tablet and phone.' });
    p.scroll(900, { dur: 3.4 });
    L.say('Then make it *yours*: change the colors, the words and the pictures, and build your own site!', { pause: 0.6 });
  });

  /* ============================== The end ============================== */
  V.part({ group: 'basics' }, L => {
    L.big('You can build <em>websites</em>! 🎉', 'Now open the course and try every example yourself.<br>Change the code, break things, and have fun.', { dur: 6 });
    L.cards([
      { ic: 'py', title: 'Python', text: 'Programs that talk, decide and draw.', color: 'var(--c-prop)' },
      { ic: '++', title: 'C++', text: 'The fast language behind games.', color: 'var(--c-val)' },
      { ic: 'TS', title: 'TypeScript', text: 'Make web pages come alive.', color: 'var(--c-attr)' }
    ], { gap: 0.6, hold: 0 });
    L.say('Want more? Hello Courses also has *Python*, *C++* and *TypeScript*. See you there!', { pause: 1 });
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:30px">
        <div data-pop data-at="0.2" class="logo-mark" style="width:150px;height:150px;border-radius:44px;font-size:56px">&lt;/&gt;</div>
        <div data-pop data-at="0.6" class="big-title" style="font-size:120px">Hello <em>HTML</em></div>
        <div data-pop data-at="1.0" class="sub">Thanks for watching!</div></div></div>`, { dur: 5 });
  });

  V.finish();
})();
