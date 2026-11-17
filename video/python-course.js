/*
  Hello Python: the whole course as one motion-graphics video.
  Built with video/engine.js; rendered with:  node video/render.js python-course
  Program output is real: render.js runs every program first (with Skulpt, the course's Python).
*/
(function () {
  const { Video } = window.HelloVideo;
  const V = new Video(document.getElementById('stage'), { name: 'Hello Python', logo: 'py' });
  window.VIDEO = V;
  const GROUP = { basics: 'First steps', style: 'Decisions & loops', parts: 'Collections', layout: 'Functions & objects', polish: 'Fun & real world', build: 'Build' };
  const lesson = (n, title, group, chip, learn, fn) => V.lesson({ n, title, group, groupName: GROUP[group], chip, learn }, fn);
  const bench = (L, code, o) => L.bench(Object.assign({ layout: 'run', kind: 'Python', files: { 'main.py': code || '' } }, o || {}));
  const CODE = k => { const c = (window.COURSE_CODE || {})['python/' + k]; if (c == null) throw new Error('No course example ' + k); return c; };
  const T = 'import turtle\nt = turtle.Turtle()\n';

  /* ============================== Intro ============================== */
  V.part({ group: 'basics' }, L => {
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:30px">
        <div data-pop data-at="0.2" class="logo-mark" style="width:190px;height:190px;border-radius:56px;font-size:84px">py</div>
        <div data-pop data-at="0.7" class="big-title" style="font-size:176px">Hello <em>Python</em></div>
        <div data-pop data-at="1.2" class="sub">Learn to code by playing with it. The whole course in one video.</div>
      </div></div>`, { dur: 5 });
    const b = bench(L, '');
    b.type('print("Hello! 👋")\nname = "Sam"\nprint("Nice to meet you,", name)', { say: 'This is *Python*. You write instructions for the computer on the left...' });
    b.run({ say: '...press *Run*, and the computer follows them, one line at a time.' });
    b.set({ 'main.py': T + 't.speed(0)\ncolors = ["hotpink", "orange", "gold",\n          "mediumseagreen", "dodgerblue"]\n\nfor i in range(36):\n    t.color(colors[i % 5])\n    t.circle(60)\n    t.left(10)\n\nprint("I drew a flower with code!")' });
    b.run({ drawTime: 3, say: 'Python can draw, too! This flower is 36 circles, each one turned a little.' });
    const chips = [['00', 'Start Here'], ['01', 'print()'], ['02', 'Variables'], ['03', 'Math'], ['04', 'Text'], ['05', 'input()'], ['06', 'if'], ['07', 'for loops'], ['08', 'while loops'],
      ['09', 'Lists'], ['10', 'Dictionaries'], ['11', 'Functions'], ['12', 'Errors'], ['13', 'Classes'], ['14', 'Turtle'], ['15', 'Modules'], ['16', 'Pocket Pet']];
    const colors = ['tag', 'tag', 'tag', 'tag', 'tag', 'tag', 'prop', 'prop', 'prop', 'attr', 'attr', 'val', 'val', 'val', 'sel', 'sel', 'tag'];
    L.html(`<div style="position:absolute;left:150px;right:150px;top:150px;display:grid;grid-template-columns:repeat(6,1fr);gap:22px">` +
      chips.map((c, i) => `<div data-pop data-at="${(0.3 + i * 0.13).toFixed(2)}" style="background:#fff;border:2px solid var(--line);border-radius:26px;padding:22px 24px;box-shadow:0 10px 30px rgba(27,25,48,.06)">
        <div style="font-family:var(--font-code);font-size:24px;color:var(--c-${colors[i]})">${c[0]}</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:33px;letter-spacing:-.01em;margin-top:6px">${c[1]}</div></div>`).join('') + `</div>`);
    L.say('*17 short lessons*. At the end, you build a virtual pet game.', { pause: 0.8 });
  });

  /* ============================== 00 Start Here ============================== */
  lesson('00', 'Start Here', 'basics', 'hello', ['What a program is', 'Why Python', 'How a program runs'], L => {
    L.big('A program is a list of <em>instructions</em>.', 'The computer follows them one by one: very fast, and exactly as written.', { dur: 5 });
    const b = bench(L, '');
    L.say('The computer reads your program from the *top* to the *bottom*, one line at a time.');
    b.stepper('python/00/0', { each: 3 });
    L.cards([
      { ic: '📖', title: 'Easy to read', text: 'Python looks almost like English.', color: 'var(--c-prop)', say: 'Python is *easy to read*: it looks almost like English.' },
      { ic: '🌍', title: 'Used everywhere', text: 'YouTube, Instagram, NASA, games, AI.', color: 'var(--c-val)', say: 'It is *used everywhere*: YouTube, Instagram, NASA, games and AI.' },
      { ic: '🎨', title: 'Fun', text: 'Games, quizzes, drawings and chatbots.', color: 'var(--c-tag)', say: 'And it is *fun*: in this course you make games, quizzes and drawings.' }
    ], { gap: 3.6, hold: 1 });
    L.remember([
      'A program is a list of instructions for the computer.',
      'It runs from top to bottom, one line at a time.',
      'Python is easy to read, and used everywhere.'
    ]);
  });

  /* ============================== 01 Your First Program ============================== */
  lesson('01', 'Your First Program', 'basics', 'print()', ['print()', 'Text in quotes', 'Printing many things', 'Comments', 'Reading errors'], L => {
    const b = bench(L, '');
    b.type('print("Hello, world!")', { say: '*print()* shows something on the screen. Text goes inside quotes.' });
    b.run({ pause: 0.2 });
    b.callout({ code: '"Hello, world!"' }, 'text in quotes', { side: 'bottom', dist: 60, say: 'The quotes tell Python: this is *text*, show it exactly like this.' });
    b.type('\nprint(7 + 3)', { say: 'Numbers don\'t need quotes. Python does the math first, then shows the answer.' });
    b.type('\nprint("I am", 12, "years old")', { pause: 0.2 });
    b.run({ say: 'Commas print several things in one line, with a space between them.' });
    b.type('\n# a comment: Python skips this line', { say: 'A line starting with *#* is a *comment*: a note for people. Python skips it.' });
    b.set({ 'main.py': 'print("Hello)' });
    b.run({ say: 'Mistakes are normal! Python tells you *which line* is wrong, and what went wrong.' });
    L.say('Here a closing quote is missing. Add it, and the error is gone.');
    L.remember([
      '`print("text")` shows text; `print(2 + 2)` shows 4.',
      'Commas print several things: `print("Age", 12)`.',
      '`# comments` are notes for people.',
      'Errors tell you the line. Read them, they help!'
    ]);
  });

  /* ============================== 02 Variables ============================== */
  lesson('02', 'Variables', 'basics', 'x = 5', ['Making variables', 'Changing them', 'Kinds of values', 'Good names'], L => {
    const b = bench(L, '');
    L.say('A *variable* is a box with a name. It remembers something for you.');
    b.stepper('python/02/0', { each: 3.2 });
    b.set({ 'main.py': '' });
    b.type('name = "Mia"\nage = 12\nprint(name, "is", age)', { say: 'The *=* sign puts a value into the box. Later, use the name to get it back.' });
    b.run({ pause: 0.2 });
    b.type('13', { replace: '12', say: 'Change what is in the box...' });
    b.run({ say: '...and everything that uses it changes too.' });
    L.cards([
      { ic: '"a"', title: 'str', text: 'Text, in quotes: <code>"Mia"</code>', color: 'var(--c-val)' },
      { ic: '42', title: 'int', text: 'Whole numbers: <code>12</code>', color: 'var(--c-prop)' },
      { ic: '3.5', title: 'float', text: 'Decimals: <code>1.75</code>', color: 'var(--c-attr)' },
      { ic: '✓', title: 'bool', text: '<code>True</code> or <code>False</code>', color: 'var(--c-tag)' }
    ], { gap: 0.6, hold: 0 });
    L.say('Values come in kinds: *text*, *whole numbers*, *decimals*, and *True or False*.', { pause: 0.8 });
    L.remember([
      '`score = 0` makes a box called score.',
      'Use the name to read it: `print(score)`.',
      'Kinds: text `"hi"`, int `12`, float `1.5`, bool `True`.',
      'Good names: `player_name`, not `x`.'
    ]);
  });

  /* ============================== 03 Numbers & Math ============================== */
  lesson('03', 'Numbers & Math', 'basics', '2 + 2', ['The math operators', 'Division, remainders, powers', 'What is done first', 'Rounding'], L => {
    const b = bench(L, '');
    b.type('print(7 + 3)\nprint(7 - 3)\nprint(7 * 3)\nprint(7 / 2)', { say: 'Python is a super calculator. `*` means times, and `/` means divided by.' });
    b.run({ pause: 0.2 });
    b.type('\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 10)', { pause: 0.2 });
    b.run({ pause: 0.2 });
    b.callout({ code: '//' }, 'whole division', { side: 'right', dist: 240, say: '`//` divides and drops the decimals: 7 // 2 is 3.' });
    b.callout({ code: '%' }, 'the remainder', { side: 'right', dist: 240, color: 'var(--c-val)', say: '`%` gives the remainder, what is left over: 7 % 2 is 1.' });
    b.callout({ code: '**' }, 'to the power of', { side: 'right', dist: 210, color: 'var(--c-attr)', say: '`**` means "to the power of": 2 ** 10 is 2 × 2 × 2... ten times, 1024.' });
    b.set({ 'main.py': 'print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(round(3.14159, 2))' });
    b.run({ say: 'Like in math class, `*` and `/` go before `+` and `-`. Brackets go first of all.' });
    L.remember([
      '`+ - * /` work like on a calculator.',
      '`//` whole division, `%` remainder, `**` power.',
      'Brackets first, then `* /`, then `+ -`.',
      '`round(3.14159, 2)` gives 3.14.'
    ]);
  });

  /* ============================== 04 Text (Strings) ============================== */
  lesson('04', 'Text (Strings)', 'basics', '"abc"', ['Joining text', 'f-strings', 'Letters by position', 'Text methods'], L => {
    const b = bench(L, '');
    b.type('name = "Python"\nprint("I love " + name)', { say: 'Text is called a *string*. Use *+* to join strings together.' });
    b.type('\nprint(f"{name} has {len(name)} letters")', { say: 'An *f-string* puts values right inside the text, in curly brackets.' });
    b.run({ pause: 0.2 });
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:36px">
        <div style="display:flex;gap:14px">${[...'Python'].map((c, i) => `<div data-pop data-quiet data-at="${0.2 + i * 0.15}" style="display:grid;justify-items:center;gap:10px">
          <div style="width:130px;height:130px;border-radius:26px;background:#fff;border:3px solid var(--line);display:grid;place-items:center;font-family:var(--font-code);font-size:70px">${c}</div>
          <div style="font-family:var(--font-code);font-size:34px;color:var(--g)">${i}</div></div>`).join('')}</div>
        <div data-pop data-at="1.6" class="sub">Every letter has a position. The first one is <code>0</code>!</div></div></div>`);
    L.say('Every letter has a *position*, called its index. Python starts counting at *0*.', { pause: 0.6 });
    const b2 = bench(L, 'name = "Python"\n');
    b2.type('print(name[0], name[-1])\nprint(name[0:3])\nprint(name.upper())', { say: '*name[0]* is the first letter. *[0:3]* cuts out a slice. *.upper()* makes capitals.' });
    b2.run({ pause: 0.4 });
    L.remember([
      'Strings are text in quotes. `+` joins them.',
      '`f"Hi {name}!"` puts values inside text.',
      '`text[0]` is the first letter; `text[0:3]` a slice.',
      '`.upper()`, `.lower()`, `len(text)` and more.'
    ]);
  });

  /* ============================== 05 Asking Questions ============================== */
  lesson('05', 'Asking Questions', 'basics', 'input()', ['input()', 'Saving the answer', 'Turning answers into numbers', 'A tiny chatbot'], L => {
    const b = bench(L, '');
    b.type('name = input("What\'s your name? ")\nprint(f"Nice to meet you, {name}!")', { say: '*input()* asks a question, then waits for the person to type an answer.' });
    b.run({ answers: ['Sam'], say: 'The answer goes into a variable, so the program can use it.' });
    b.set({ 'main.py': 'age = input("How old are you? ")\nprint(age + 1)' });
    b.run({ answers: ['12'], say: 'Uh oh! An answer is always *text*, and you can\'t add 1 to text.' });
    b.type('int(input("How old are you? "))', { replace: 'input("How old are you? ")', say: '*int()* turns the text "12" into the number 12.' });
    b.run({ answers: ['12'], say: 'Now the math works!' });
    const c = bench(L, CODE('05/Robo the chatbot'), { font: 20, edWidth: 940 });
    c.run({ answers: ['sam', '2014', 'Blue'], lineTime: 0.12, say: 'With input, print and variables, you can already build a little *chatbot*.' });
    L.remember([
      '`answer = input("Question? ")` asks and waits.',
      'Answers are always text.',
      '`int(input(...))` turns the answer into a number.'
    ]);
  });

  /* ============================== 06 Making Decisions ============================== */
  lesson('06', 'Making Decisions', 'style', 'if', ['Comparing values', 'if, else and elif', 'Indentation', 'and, or, not'], L => {
    const b = bench(L, '');
    b.type('age = 10\nif age >= 13:\n    print("You can join!")\nelse:\n    print("Come back in", 13 - age, "years")', { say: '*if* runs code only when something is True. *else* runs when it is not.' });
    b.run({ pause: 0.2 });
    b.callout({ code: ':', occ: 0 }, 'a colon', { side: 'right', dist: 60, dur: 6.8, wait: false });
    b.callout({ code: '    print("You' }, '4 spaces: "inside the if"', { side: 'bottom', dist: 120, delay: 1.3, dur: 5.5, wait: false, color: 'var(--c-val)' });
    L.say('The line ends with a *colon*, and the lines inside are pushed in by *4 spaces*.', { dur: 6.9 });
    b.type('15', { replace: '10', from: 'age', pause: 0.1 });
    b.run({ say: 'Change the age, and the program takes the other path.' });
    L.say('*elif* checks more questions, in order, until one is True. Watch:');
    b.stepper('python/06/0', { each: 3 });
    L.remember([
      'Compare: `==` `!=` `<` `>` `<=` `>=`.',
      '`if`, `elif`, `else`, each line ending with `:`.',
      'Lines inside are pushed in by 4 spaces.',
      'Combine questions with `and`, `or`, `not`.'
    ]);
  });

  /* ============================== 07 Loops with for ============================== */
  lesson('07', 'Loops with for', 'style', 'for', ['for and range()', 'Adding things up', 'Looping over text', 'Drawing with loops'], L => {
    const b = bench(L, '');
    b.type('for i in range(5):\n    print("Hello number", i)', { say: 'A *for* loop repeats code. *range(5)* counts 0, 1, 2, 3, 4.' });
    b.run({ say: 'Two lines of code, five lines of output. No copying!' });
    L.say('The loop variable can add things up. Watch the total grow:');
    b.stepper('python/07/0', { each: 2.3 });
    const d = bench(L, T + 't.pensize(4)\n');
    d.type('for i in range(4):\n    t.forward(120)\n    t.left(90)', { say: 'Loops are perfect for drawing. Forward and turn, four times: a square!' });
    d.run({ pause: 0.2 });
    d.type('range(8)', { replace: 'range(4)', pause: 0.1 });
    d.type('45', { replace: '90', say: 'Eight times, turning 45 degrees each time: an octagon.' });
    d.run({ pause: 0.4 });
    L.remember([
      '`for i in range(5):` repeats 5 times (0 to 4).',
      '`for letter in "hello":` visits every letter.',
      'Add up in a loop: `total = total + i`.',
      'Loops + turtle = shapes and patterns.'
    ]);
  });

  /* ============================== 08 Loops with while ============================== */
  lesson('08', 'Loops with while', 'style', 'while', ['while loops', 'Loops that never end', 'break', 'A guessing game'], L => {
    const b = bench(L, '');
    b.type('count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1\nprint("Lift off! 🚀")', { say: '*while* repeats as long as something is True.' });
    b.run({ say: 'Each time around, count gets 1 smaller. At 0 the question is False, so the loop stops.' });
    L.say('Careful: if the question is *always* True, the loop never ends! The course shows you how to stop it.');
    b.set({ 'main.py': 'secret = 7\n\nwhile True:\n    guess = int(input("Your guess: "))\n    if guess < secret:\n        print("Too low ⬆️")\n    elif guess > secret:\n        print("Too high ⬇️")\n    else:\n        print("🎉 You got it!")\n        break' });
    L.say('A guessing game: keep asking until the guess is right. *break* leaves the loop.');
    b.run({ answers: ['3', '9', '7'], say: 'In the lesson, the secret number is random, so every game is different.' });
    L.remember([
      '`while something:` repeats while it is True.',
      'Make sure something changes, or it loops forever.',
      '`break` leaves the loop right away.',
      '`for` when you know how many times; `while` when you don\'t.'
    ]);
  });

  /* ============================== 09 Lists ============================== */
  lesson('09', 'Lists', 'parts', '[ ]', ['Making lists', 'Getting items by position', 'Adding and removing', 'Looping over a list'], L => {
    const b = bench(L, '');
    b.type('fruits = ["apple", "banana", "cherry"]\nprint(fruits)\nprint(fruits[0])\nprint(len(fruits), "fruits")', { say: 'A *list* holds many things, in order, inside square brackets.' });
    b.run({ say: 'Just like letters in text, the first item is at position *0*.' });
    L.say('Lists can grow and shrink. Watch the boxes:');
    b.stepper('python/09/0', { each: 2.8 });
    b.set({ 'main.py': 'friends = ["Lina", "Omar", "Maya", "Sam"]\n\n' });
    b.type('for friend in friends:\n    print(f"Hi {friend}! 👋")', { say: 'A *for* loop visits every item in the list, one by one.' });
    b.run({ pause: 0.4 });
    L.remember([
      '`items = ["a", "b", "c"]`; `items[0]` is the first.',
      '`.append()` adds, `.remove()` takes out.',
      '`for item in items:` visits every item.',
      '`len()`, `sum()`, `max()`, `sorted()` work on lists.'
    ]);
  });

  /* ============================== 10 Dictionaries ============================== */
  lesson('10', 'Dictionaries', 'parts', '{ }', ['Keys and values', 'Looking things up', 'Adding and changing', 'Looping over a dictionary'], L => {
    const b = bench(L, '');
    b.type('ages = {"Lina": 12, "Omar": 14}\nprint(ages["Omar"])', { say: 'A *dictionary* stores pairs: a *key* and its *value*. Look things up by the key.' });
    b.run({ pause: 0.2 });
    b.type('\nages["Maya"] = 11\nfor name, age in ages.items():\n    print(name, "is", age)', { say: 'Add a new pair by giving a new key a value. *.items()* loops over all the pairs.' });
    b.run({ pause: 0.4 });
    L.say('Watch a game character change, key by key:');
    b.stepper('python/10/0', { each: 2.9 });
    L.remember([
      '`d = {"key": value}` stores pairs.',
      '`d["key"]` looks up; `d["key"] = 5` adds or changes.',
      '`for key, value in d.items():` visits every pair.',
      'Great for counting and for describing things.'
    ]);
  });

  /* ============================== 11 Functions ============================== */
  lesson('11', 'Functions', 'layout', 'def', ['def: making a function', 'Parameters', 'return', 'Variables inside functions'], L => {
    const b = bench(L, '');
    b.type('def greet(name):\n    print(f"Hello, {name}! 👋")\n\ngreet("Sam")\ngreet("Lina")', { say: '*def* makes your own command, called a *function*. *name* is a parameter: a value you give it.' });
    b.run({ say: 'Write it once, use it as many times as you like.' });
    L.say('When you call a function, Python jumps into it, then jumps back. Watch:');
    b.stepper('python/11/0', { each: 2.8 });
    b.set({ 'main.py': '' });
    b.type('def double(n):\n    return n * 2\n\nprint(double(21))', { say: '*return* gives an answer back, so you can use it.' });
    b.run({ pause: 0.4 });
    L.remember([
      '`def name(params):` makes a function.',
      'Call it with `name(values)`.',
      '`return` gives an answer back.',
      'Variables inside a function stay inside.'
    ]);
  });

  /* ============================== 12 Errors & Debugging ============================== */
  lesson('12', 'Errors & Debugging', 'layout', 'try', ['Three kinds of errors', 'Common errors', 'Finding bugs', 'try and except'], L => {
    L.cards([
      { ic: '✍️', title: 'Syntax error', text: 'Python can\'t read it: a missing quote, bracket or colon.', color: 'var(--c-tag)' },
      { ic: '💥', title: 'Runtime error', text: 'It crashes while running, like dividing by zero.', color: 'var(--c-attr)' },
      { ic: '🤔', title: 'Logic error', text: 'It runs, but the answer is wrong. The sneakiest!', color: 'var(--c-sel)' }
    ], { gap: 0.6, hold: 0 });
    L.say('There are three kinds of errors. Every programmer meets all three, every day.', { pause: 0.6 });
    const b = bench(L, '');
    b.type('nmae = "Sam"\nprint(name)', { say: 'Can you spot the bug?' });
    b.run({ say: 'A *NameError*: Python doesn\'t know "name", because line 1 has a typo.' });
    b.set({ 'main.py': '' });
    b.type('try:\n    age = int(input("Age? "))\n    print("Next year:", age + 1)\nexcept ValueError:\n    print("Please type a number!")', { cps: 24, say: '*try* and *except* catch an error, so the program can answer politely instead of crashing.' });
    b.run({ answers: ['twelve'], say: '"twelve" is not a number, so the except part runs.' });
    L.remember([
      'Read the error: its name and its line number.',
      'NameError = unknown name, TypeError = wrong kind.',
      'Print values to find a bug.',
      '`try:` ... `except ValueError:` handles problems.'
    ]);
  });

  /* ============================== 13 Classes & Objects ============================== */
  lesson('13', 'Classes & Objects', 'layout', 'class', ['Classes and objects', '__init__ and self', 'Methods', 'Many objects'], L => {
    const b = bench(L, '', { font: 24 });
    b.type('class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        print(f"{self.name} says Woof!")\n\nrex = Dog("Rex")\nfido = Dog("Fido")\nrex.bark()\nfido.bark()', { cps: 24, say: 'A *class* is a blueprint. From one blueprint you can make many *objects*.' });
    b.run({ pause: 0.2 });
    b.callout({ code: '__init__' }, 'runs when a dog is made', { side: 'right', dist: 60, dur: 4.5, wait: false });
    L.say('*__init__* sets up each new object. *self* means "this object".', { dur: 4.7 });
    b.callout({ code: 'def bark' }, 'a method', { side: 'right', dist: 100, dur: 3.5, wait: false, color: 'var(--c-val)' });
    L.say('Functions inside a class are called *methods*: things the object can do.', { dur: 4.4 });
    L.say('Watch an object being made, step by step:');
    b.stepper('python/13/0', { each: 2.9 });
    L.remember([
      '`class Dog:` is the blueprint; `Dog("Rex")` an object.',
      '`__init__` sets up a new object.',
      '`self.name` is the object\'s own data.',
      'Methods are the things it can do: `rex.bark()`.'
    ]);
  });

  /* ============================== 14 Drawing with Turtle ============================== */
  lesson('14', 'Drawing with Turtle', 'polish', 'turtle', ['Moving and turning', 'Colors and filling', 'Spirals', 'Random art'], L => {
    const b = bench(L, T);
    b.type('t.color("hotpink")\nt.pensize(5)\nt.forward(150)\nt.left(90)\nt.forward(100)', { say: 'The *turtle* is a little pen. *forward* moves it, *left* and *right* turn it.' });
    b.run({ pause: 0.2 });
    b.set({ 'main.py': T + 't.speed(0)\n' });
    b.type('for i in range(80):\n    t.color(["orange", "hotpink"][i % 2])\n    t.forward(i * 3)\n    t.left(91)', { say: 'Turn a bit more than 90 degrees each time, and walk a bit further: a *spiral*!' });
    b.run({ drawTime: 3, pause: 0.2 });
    b.set({ 'main.py': CODE('14/Confetti') });
    b.run({ drawTime: 3, say: 'With *random* colors and places, every run makes new art.' });
    L.remember([
      '`t.forward(100)`, `t.left(90)`, `t.right(45)`.',
      '`t.color("pink")`, `t.pensize(4)`.',
      '`begin_fill()` and `end_fill()` fill a shape.',
      'Loops make patterns and spirals.'
    ]);
  });

  /* ============================== 15 Modules ============================== */
  lesson('15', 'Modules: random, math & more', 'polish', 'import', ['import', 'random', 'math', 'time'], L => {
    const b = bench(L, '');
    b.type('import random\n\nprint(random.randint(1, 6))\nprint(random.choice(["rock", "paper", "scissors"]))', { say: '*import* opens a toolbox of ready-made code. *random* rolls dice and picks surprises.' });
    b.run({ pause: 0.2 });
    b.type('\n\nimport math\nprint(math.sqrt(144))\nprint(math.pi)', { say: '*math* has square roots, pi and much more.' });
    b.run({ pause: 0.2 });
    L.say('*time* can make your program wait. And thousands more modules exist, for games, websites and science.');
    L.remember([
      '`import random`, then `random.randint(1, 6)`.',
      '`random.choice(list)` picks one item.',
      '`import math`: `math.sqrt()`, `math.pi`.',
      '`import time`: `time.sleep(1)` waits a second.'
    ]);
  });

  /* ============================== 16 Final Project ============================== */
  lesson('16', 'Final Project', 'build', 'game', ['Planning a program', 'Building it piece by piece', 'The game loop', 'Making it yours'], L => {
    const b = bench(L, CODE('16/Pocket Pet'), { font: 20, edWidth: 860, scrollCode: 0 });
    L.say('In the final project, you build *Pocket Pet*: a virtual pet you feed, play with and put to sleep.');
    b.run({ answers: ['mochi', 'f', 'fish', 'p', 'q'], lineTime: 0.05, say: 'Name your pet, then choose what to do each day. Keep it happy for 10 days to win!' });
    L.wait(1.5);
    const steps = ['Plan before you code', 'The data: a dictionary of foods', 'The Pet class', 'The game loop', 'The ending'];
    L.html(`<div style="position:absolute;left:330px;right:330px;top:150px;display:grid;gap:20px">${steps.map((s, i) =>
      `<div data-pop style="display:flex;gap:24px;align-items:center;background:#fff;border:2px solid var(--line);border-radius:28px;padding:20px 28px">
        <span style="flex:none;width:70px;height:70px;border-radius:22px;background:var(--ink);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:38px">${i + 1}</span>
        <span style="font-family:var(--font-display);font-weight:800;font-size:40px;letter-spacing:-.01em">${s}</span></div>`).join('')}</div>`, { gap: 0.5 });
    L.say('You build it in five small steps, using everything from the course: variables, lists, loops, functions and a class.', { pause: 1 });
    L.say('Then make it *yours*: new foods, new pets, new surprises!', { pause: 0.6 });
  });

  /* ============================== The end ============================== */
  V.part({ group: 'basics' }, L => {
    L.big('You can <em>code</em>! 🎉', 'Now open the course and try every example yourself.<br>Change the code, break things, and have fun.', { dur: 6 });
    L.cards([
      { ic: '&lt;/&gt;', title: 'HTML & CSS', text: 'Build your own websites.', color: 'var(--c-tag)' },
      { ic: '++', title: 'C++', text: 'The fast language behind games.', color: 'var(--c-val)' },
      { ic: 'TS', title: 'TypeScript', text: 'Make web pages come alive.', color: 'var(--c-attr)' }
    ], { gap: 0.6, hold: 0 });
    L.say('Want more? Hello Courses also has *HTML*, *C++* and *TypeScript*. See you there!', { pause: 1 });
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:30px">
        <div data-pop data-at="0.2" class="logo-mark" style="width:150px;height:150px;border-radius:44px;font-size:64px">py</div>
        <div data-pop data-at="0.6" class="big-title" style="font-size:120px">Hello <em>Python</em></div>
        <div data-pop data-at="1.0" class="sub">Thanks for watching!</div></div></div>`, { dur: 5 });
  });

  V.finish();
})();
