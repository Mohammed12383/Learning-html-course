/*
  Hello C++: the whole course as one motion-graphics video.
  Built with video/engine.js; rendered with:  node video/render.js cpp-course
  Program output is real: render.js compiles and runs every program first (with g++).
*/
(function () {
  const { Video } = window.HelloVideo;
  const V = new Video(document.getElementById('stage'), { name: 'Hello C++', logo: 'c++' });
  window.VIDEO = V;
  const GROUP = { basics: 'First steps', style: 'Decisions & loops', parts: 'Collections', layout: 'Functions & memory', polish: 'Objects & power tools', build: 'Build' };
  const lesson = (n, title, group, chip, learn, fn) => V.lesson({ n, title, group, groupName: GROUP[group], chip, learn }, fn);
  const bench = (L, code, o) => L.bench(Object.assign({ layout: 'run', kind: 'C++', font: 22, files: { 'main.cpp': code || '' } }, o || {}));
  const CODE = k => { const c = (window.COURSE_CODE || {})['cpp/' + k]; if (c == null) throw new Error('No course example ' + k); return c; };
  // a whole program around some lines of main()
  const MAIN = (body, inc) => (inc || '#include <iostream>') + '\nusing namespace std;\n\nint main() {\n' + body + '\n    return 0;\n}';
  const IN_MAIN = { before: '\n    return 0;' };

  /* ============================== Intro ============================== */
  V.part({ group: 'basics' }, L => {
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:30px">
        <div data-pop data-at="0.2" class="logo-mark" style="width:190px;height:190px;border-radius:56px;font-size:66px">c++</div>
        <div data-pop data-at="0.7" class="big-title" style="font-size:176px">Hello <em>C++</em></div>
        <div data-pop data-at="1.2" class="sub">The language behind games, step by step. The whole course in one video.</div>
      </div></div>`, { dur: 5 });
    const b = bench(L, MAIN('    cout << "Hello from C++! 🚀" << endl;'));
    L.say('This is *C++*. You write the code on the left...');
    b.run({ say: '...press *Run*: a *compiler* turns it into a real program, and the program runs.' });
    b.type('\n    for (int i = 3; i > 0; i--) {\n        cout << i << "... ";\n    }\n    cout << "Go! 🏁" << endl;', Object.assign({ say: 'Fast programs, games, robots: they all start with lines like these.' }, IN_MAIN));
    b.run({ pause: 0.5 });
    const chips = [['00', 'Start Here'], ['01', 'Hello, World!'], ['02', 'Variables'], ['03', 'Math'], ['04', 'Input'], ['05', 'Decisions'], ['06', 'Loops'], ['07', 'Vectors'], ['08', 'Strings'],
      ['09', 'Functions'], ['10', 'Pointers'], ['11', 'Structs'], ['12', 'Classes'], ['13', 'Inheritance'], ['14', 'The STL'], ['15', 'Real Programs'], ['16', 'Robot Arena']];
    const colors = ['tag', 'tag', 'tag', 'tag', 'tag', 'prop', 'prop', 'attr', 'attr', 'val', 'val', 'val', 'sel', 'sel', 'sel', 'sel', 'tag'];
    L.html(`<div style="position:absolute;left:150px;right:150px;top:150px;display:grid;grid-template-columns:repeat(6,1fr);gap:22px">` +
      chips.map((c, i) => `<div data-pop data-at="${(0.3 + i * 0.13).toFixed(2)}" style="background:#fff;border:2px solid var(--line);border-radius:26px;padding:22px 24px;box-shadow:0 10px 30px rgba(27,25,48,.06)">
        <div style="font-family:var(--font-code);font-size:24px;color:var(--c-${colors[i]})">${c[0]}</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:33px;letter-spacing:-.01em;margin-top:6px">${c[1]}</div></div>`).join('') + `</div>`);
    L.say('*17 short lessons*. At the end, you build a robot battle game.', { pause: 0.8 });
  });

  /* ============================== 00 Start Here ============================== */
  lesson('00', 'Start Here', 'basics', 'hello', ['What a program is', 'Why C++', 'What a compiler does'], L => {
    L.big('A program is a list of <em>instructions</em>.', 'The computer follows them one by one, very fast, exactly as written.', { dur: 4.6 });
    const box = (ic, t, s, c) => `<div data-pop style="width:430px;background:#fff;border:2px solid var(--line);border-radius:34px;padding:34px;box-shadow:0 20px 50px rgba(27,25,48,.08);text-align:center">
      <div style="font-size:84px">${ic}</div><div style="font-family:var(--font-display);font-weight:800;font-size:46px;margin-top:8px;color:${c}">${t}</div><div style="font-size:29px;color:var(--ink-2);margin-top:6px">${s}</div></div>`;
    const arrow = '<div data-pop data-quiet style="font-size:90px;color:var(--ink-3)">→</div>';
    L.html(`<div class="center"><div style="display:flex;align-items:center;gap:28px">
      ${box('📝', 'main.cpp', 'the code you write', 'var(--c-prop)')}${arrow}${box('⚙️', 'compiler', 'translates it', 'var(--c-attr)')}${arrow}${box('🚀', 'program', 'the computer runs it', 'var(--c-val)')}</div></div>`, { gap: 1 });
    L.say('C++ needs a *compiler*. It translates your code into the computer\'s own language, before it runs.', { pause: 0.4 });
    L.say('If something is wrong, the compiler stops and tells you the line. Then you fix it and try again.', { pause: 0.4 });
    L.cards([
      { ic: '⚡', title: 'Fast', text: 'One of the fastest languages there is.', color: 'var(--c-attr)', say: 'C++ is *fast*: one of the fastest programming languages in the world.' },
      { ic: '🎮', title: 'Everywhere', text: 'Games, browsers, robots, Mars rovers.', color: 'var(--c-prop)', say: 'It runs *game engines*, web browsers, robots, and even rovers on Mars.' },
      { ic: '🧠', title: 'Deep', text: 'Learn how computers really work.', color: 'var(--c-val)', say: 'And it shows you how computers *really* work, with memory you can see.' }
    ], { gap: 3.4, hold: 1 });
    L.remember([
      'A program is a list of instructions.',
      'A compiler turns your C++ code into a program.',
      'C++ is fast and runs games, apps and robots.'
    ]);
  });

  /* ============================== 01 Hello, World! ============================== */
  lesson('01', 'Hello, World!', 'basics', 'cout <<', ['The program frame', 'cout and <<', 'New lines', 'Comments', 'Compile errors'], L => {
    const b = bench(L, MAIN('    cout << "Hello, world!" << endl;'));
    L.say('Every C++ program has the same *frame*. Let\'s read it line by line.');
    b.callout({ code: '#include <iostream>' }, 'adds the tools for cout', { side: 'right', dist: 50, say: '*#include* adds a toolbox. iostream has *cout*, for printing.' });
    b.callout({ code: 'int main()' }, 'the program starts here', { side: 'right', dist: 50, say: 'The program starts inside *main*, between the curly brackets.' });
    b.callout({ code: 'cout << "Hello, world!" << endl;' }, 'print!', { side: 'bottom', dist: 50, color: 'var(--c-val)', say: '*cout <<* prints. *endl* ends the line. And every instruction ends with a *;*' });
    b.run({ pause: 0.2 });
    b.type('\n    cout << "I am " << 12 << " years old\\n";', Object.assign({ say: 'Chain things with *<<*. *\\n* inside text is another way to start a new line.' }, IN_MAIN));
    b.type('\n    // a comment: notes for people', Object.assign({ pause: 0.2 }, IN_MAIN));
    b.run({ say: 'Lines starting with *//* are comments. The compiler skips them.' });
    b.type('endl', { replace: 'endl;', pause: 0.1 });
    b.run({ say: 'Forget one semicolon, and the program *doesn\'t compile*. The compiler shows the line.' });
    L.say('Reading these messages is a real programmer skill. The course explains each one in plain words.');
    L.remember([
      'Every program: `#include`, then `int main() { ... }`.',
      '`cout << "text" << endl;` prints a line.',
      'Every instruction ends with `;`.',
      '`// comments` are notes; errors show the line.'
    ]);
  });

  /* ============================== 02 Variables & Types ============================== */
  lesson('02', 'Variables & Types', 'basics', 'int x', ['Making variables', 'int, double, char, bool, string', 'Changing values', 'const and auto'], L => {
    const b = bench(L, '');
    L.say('A *variable* is a box in memory with a name. In C++, every box has a *type*.');
    b.stepper('cpp/02/0', { each: 3 });
    b.set({ 'main.cpp': MAIN('    int age = 12;\n    double height = 1.55;\n    char grade = \'A\';\n    bool happy = true;\n    string name = "Zara";\n\n    cout << name << " is " << age << endl;', '#include <iostream>\n#include <string>') });
    L.say('The type says what can go in the box:');
    b.callout({ code: 'int age' }, 'whole numbers', { side: 'right', dist: 330, say: '*int* holds whole numbers. *double* holds decimals.' });
    b.callout({ code: 'char grade' }, 'one character', { side: 'right', dist: 330, color: 'var(--c-val)', say: '*char* is one letter, *bool* is true or false, *string* is text.' });
    b.run({ pause: 0.2 });
    b.type('\n    age = "twelve";', Object.assign({ say: 'The type can never change. Put text in an int box...' }, { after: 'int age = 12;' }));
    b.run({ say: '...and the compiler says no. This catches mistakes before the program even runs.' });
    L.remember([
      '`int age = 12;` makes an int box called age.',
      'Types: `int`, `double`, `char`, `bool`, `string`.',
      'A box\'s type never changes.',
      '`const` boxes can\'t change; `auto` guesses the type.'
    ]);
  });

  /* ============================== 03 Math ============================== */
  lesson('03', 'Math', 'basics', '7 / 2', ['The operators', 'The integer division surprise', 'The remainder %', '++ and +='], L => {
    const b = bench(L, MAIN('    cout << 7 + 2 << endl;\n    cout << 7 * 2 << endl;'));
    b.type('\n    cout << 7 / 2 << endl;', Object.assign({ say: 'C++ does math with `+ - * /`. But watch this one carefully...' }, IN_MAIN));
    b.run({ say: '7 divided by 2 is... *3*?! When both numbers are ints, the decimals are thrown away.' });
    b.type('\n    cout << 7.0 / 2 << endl;\n    cout << 7 % 2 << endl;', Object.assign({ pause: 0.2 }, IN_MAIN));
    b.run({ say: 'Write *7.0* to get 3.5. And *%* gives the remainder: 7 % 2 is 1.' });
    b.set({ 'main.cpp': MAIN('    int score = 10;\n    score += 5;\n    score++;\n    cout << score << endl;\n    cout << sqrt(144) << " " << pow(2, 10) << endl;', '#include <iostream>\n#include <cmath>') });
    b.run({ say: '*+=* adds to a box, *++* adds one. *<cmath>* has square roots, powers and more.' });
    L.remember([
      '`+ - * /` and `%` (remainder).',
      'int / int throws away decimals: `7 / 2` is 3.',
      '`score += 5;` and `score++;`',
      '`#include <cmath>`: `sqrt()`, `pow()`.'
    ]);
  });

  /* ============================== 04 Input with cin ============================== */
  lesson('04', 'Input with cin', 'basics', 'cin >>', ['cin and >>', 'Reading several values', 'getline', 'Checking the input'], L => {
    const b = bench(L, MAIN('    string name;\n    int age;\n    cin >> name >> age;\n\n    cout << "Hi " << name << "!" << endl;\n    cout << "Next year you will be " << age + 1 << endl;', '#include <iostream>\n#include <string>'));
    L.say('*cin >>* reads what the person types, and stores it in a variable.');
    b.callout({ code: 'cin >> name >> age;' }, 'read a word, then a number', { side: 'bottom', dist: 60, say: 'This line reads a word into *name*, then a number into *age*.' });
    b.run({ stdin: 'Zara 12', say: 'In the course, you type the input in a box *before* pressing Run, like here.' });
    L.say('*getline* reads a whole line with spaces, and the course shows how to check if the input was really a number.');
    L.remember([
      '`cin >> x;` reads one value into x.',
      '`cin >> a >> b;` reads two.',
      '`getline(cin, line);` reads a whole line.',
      'Check the input: `if (cin >> n)`.'
    ]);
  });

  /* ============================== 05 Making Decisions ============================== */
  lesson('05', 'Making Decisions', 'style', 'if', ['Comparing values', 'if, else if, else', '&&, || and !', 'switch'], L => {
    const b = bench(L, MAIN('    int temp = 30;\n\n    if (temp > 25) {\n        cout << "Hot! 🥵" << endl;\n    } else {\n        cout << "Nice and cool 🙂" << endl;\n    }'));
    L.say('*if* runs code only when the question in brackets is *true*. *else* runs otherwise.');
    b.run({ pause: 0.2 });
    b.type('18', { replace: '30', pause: 0.1 });
    b.run({ say: 'Change the temperature, and the other block runs.' });
    L.say('*else if* asks more questions, in order. Watch the computer check each one:');
    b.stepper('cpp/05/0', { each: 3 });
    L.remember([
      'Compare: `==` `!=` `<` `>` `<=` `>=`.',
      '`if (...) { } else if (...) { } else { }`',
      'And `&&`, or `||`, not `!`.',
      '`switch` picks one of many cases.'
    ]);
  });

  /* ============================== 06 Loops ============================== */
  lesson('06', 'Loops', 'style', 'for', ['for loops', 'while and do-while', 'break and continue', 'Loops inside loops'], L => {
    const b = bench(L, MAIN('    for (int i = 1; i <= 5; i++) {\n        cout << i << " ";\n    }\n    cout << endl;'));
    L.say('A *for* loop repeats a block. Its first line has three parts:');
    b.callout({ code: 'int i = 1' }, 'start', { side: 'bottom', dist: 50, dur: 7.5, wait: false });
    b.callout({ code: 'i <= 5' }, 'keep going while true', { side: 'bottom', dist: 120, delay: 1.2, dur: 6.3, wait: false, color: 'var(--c-val)' });
    b.callout({ code: 'i++' }, 'after each round', { side: 'bottom', dist: 190, delay: 2.4, dur: 5.1, wait: false, color: 'var(--c-attr)' });
    L.say('Where to *start*, when to *keep going*, and what to do *after each round*.', { dur: 7.6 });
    b.run({ pause: 0.2 });
    b.stepper('cpp/06/0', { each: 2.2 });
    b.set({ 'main.cpp': MAIN('    for (int row = 1; row <= 5; row++) {\n        for (int s = 0; s < row; s++) {\n            cout << "⭐";\n        }\n        cout << endl;\n    }') });
    b.run({ say: 'A loop inside a loop draws patterns: each row gets one more star.' });
    L.remember([
      '`for (int i = 0; i < 5; i++) { }` repeats 5 times.',
      '`while (x > 0) { }` repeats while true.',
      '`break` leaves; `continue` skips to the next round.',
      'Loops inside loops make grids and patterns.'
    ]);
  });

  /* ============================== 07 Arrays & Vectors ============================== */
  lesson('07', 'Arrays & Vectors', 'parts', 'vector<int>', ['Arrays', 'Vectors', 'Adding and removing', 'Looping over a list'], L => {
    const b = bench(L, '');
    L.say('A *vector* is a row of boxes, all of the same type. It can grow and shrink.');
    b.stepper('cpp/07/0', { each: 3 });
    b.set({ 'main.cpp': MAIN('    vector<int> scores = {72, 95, 88};\n    scores.push_back(64);\n\n    int total = 0;\n    for (int s : scores) {\n        total += s;\n    }\n    cout << "Scores: " << scores.size() << endl;\n    cout << "Total: " << total << endl;\n    cout << "First: " << scores[0] << endl;', '#include <iostream>\n#include <vector>') });
    b.callout({ code: 'for (int s : scores)' }, 'visit every item', { side: 'right', dist: 60, say: 'This loop visits every score, one by one, and adds it to the total.' });
    b.run({ say: 'Like in most languages, the first item is at index *0*.' });
    L.say('Careful: index 3 in a vector of 3 items is *past the end*. C++ won\'t always warn you, so the course shows how to stay inside the boxes.');
    L.remember([
      '`vector<int> v = {1, 2, 3};` needs `<vector>`.',
      '`v.push_back(4)` adds, `v.pop_back()` removes.',
      '`v[0]` is the first; `v.size()` the count.',
      '`for (int x : v)` visits every item.'
    ]);
  });

  /* ============================== 08 Strings ============================== */
  lesson('08', 'Strings', 'parts', 'string', ['Joining text', 'Characters by position', 'substr, find and replace', 'Text and numbers'], L => {
    const b = bench(L, MAIN('    string name = "Zara";\n    cout << "Hi " + name + "!" << endl;\n    cout << name.length() << " letters" << endl;\n    cout << name[0] << endl;', '#include <iostream>\n#include <string>'));
    L.say('A *string* is a row of characters. *+* joins strings together.');
    b.run({ say: '*.length()* counts the letters, and *name[0]* is the first one.' });
    b.type('\n    string s = "I love pizza";\n    cout << s.substr(7) << endl;\n    cout << s.find("love") << endl;', Object.assign({ say: '*substr* cuts out a piece. *find* tells you where something is.' }, IN_MAIN));
    b.run({ pause: 0.2 });
    b.type('\n    cout << stoi("42") + 1 << endl;', Object.assign({ say: '*stoi* turns text into a number, and *to_string* turns a number into text.' }, IN_MAIN));
    b.run({ pause: 0.4 });
    L.remember([
      '`string s = "hi";` and `+` joins strings.',
      '`s.length()`, `s[0]`, `s.substr(2)`, `s.find("x")`.',
      '`stoi("42")` text → number; `to_string(42)` back.',
      'Loop over every letter: `for (char c : s)`.'
    ]);
  });

  /* ============================== 09 Functions ============================== */
  lesson('09', 'Functions', 'layout', 'int f()', ['Writing functions', 'Parameters and return', 'void', 'Copy or reference'], L => {
    const b = bench(L, '#include <iostream>\nusing namespace std;\n\n');
    b.type('int square(int n) {\n    return n * n;\n}\n\nint main() {\n    cout << square(4) << endl;\n    cout << square(9) << endl;\n    return 0;\n}', { cps: 24, say: 'A *function* is a named piece of code. This one takes an int and *returns* its square.' });
    b.callout({ code: 'int square(int n)' }, 'gives back an int, takes an int', { side: 'right', dist: 40, say: 'The first *int* is what it gives back. *(int n)* is the value you pass in.' });
    b.run({ pause: 0.2 });
    L.say('When main calls a function, the program jumps in, then jumps back with the answer:');
    b.stepper('cpp/09/0', { each: 2.7 });
    L.say('Functions get a *copy* of each value. Add *&* to use the real variable instead. The course shows both, side by side.');
    L.remember([
      '`int add(int a, int b) { return a + b; }`',
      '`void` = the function gives nothing back.',
      'Parameters are copies; `int& x` is the real one.',
      'Small functions make big programs easy.'
    ]);
  });

  /* ============================== 10 Memory & Pointers ============================== */
  lesson('10', 'Memory & Pointers', 'layout', '*p', ['Memory addresses', '&: the address of', 'Pointers and *', 'nullptr'], L => {
    const cells = [['0x1000', '7', ''], ['0x1004', '12', 'age'], ['0x1008', '0x1004', 'p'], ['0x100C', '…', '']];
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:40px">
      <div style="display:flex;gap:18px">${cells.map((c, i) => `<div data-pop data-at="${0.3 + i * 0.3}" style="display:grid;justify-items:center;gap:10px">
        <div style="font-family:var(--font-code);font-size:28px;color:var(--c-prop);height:36px">${c[2]}</div>
        <div style="width:250px;height:150px;border-radius:24px;background:#fff;border:3px solid ${c[2] ? 'var(--g)' : 'var(--line)'};display:grid;place-items:center;font-family:var(--font-code);font-size:46px">${c[1]}</div>
        <div style="font-family:var(--font-code);font-size:26px;color:var(--ink-3)">${c[0]}</div></div>`).join('')}</div>
      <div data-pop data-at="1.8" class="sub">Every box in memory has an <b>address</b>. A pointer stores an address.</div></div></div>`);
    L.say('Memory is a long row of boxes, and every box has an *address*, like a house number.', { pause: 0.4 });
    L.say('A *pointer* is a box that holds the address of another box. Here, *p* points at *age*.', { pause: 0.4 });
    const b = bench(L, '');
    b.stepper('cpp/10/0', { each: 3.2 });
    L.say('*nullptr* means "pointing at nothing". Always check before you follow a pointer.');
    L.remember([
      '`&age` = the address of age.',
      '`int* p = &age;` p points at age.',
      '`*p` = go to the address and use that box.',
      '`nullptr` = points at nothing. Check first!'
    ]);
  });

  /* ============================== 11 Structs ============================== */
  lesson('11', 'Structs', 'layout', 'struct', ['Making a struct', 'Reading and changing fields', 'Vectors of structs', 'Structs and functions'], L => {
    const b = bench(L, '#include <iostream>\n#include <string>\nusing namespace std;\n\n');
    b.type('struct Hero {\n    string name;\n    int hp;\n    int level;\n};\n\nint main() {\n    Hero zara = {"Zara", 100, 1};\n    zara.hp -= 30;\n    zara.level++;\n    cout << zara.name << ": " << zara.hp << " hp, level "\n         << zara.level << endl;\n    return 0;\n}', { cps: 26, say: 'A *struct* makes your own type, by grouping a few values together.' });
    b.callout({ code: 'zara.hp' }, 'the dot reaches a field', { side: 'right', dist: 60, say: 'A *dot* reaches inside: *zara.hp* is Zara\'s health.' });
    b.run({ pause: 0.4 });
    L.say('Put structs in a vector, and you have a whole table: a class list, a team of heroes, a high-score board.');
    L.remember([
      '`struct Hero { string name; int hp; };`',
      '`Hero zara = {"Zara", 100};`',
      '`zara.hp -= 30;` changes one field.',
      '`vector<Hero>` makes a table.'
    ]);
  });

  /* ============================== 12 Classes ============================== */
  lesson('12', 'Classes', 'polish', 'class', ['public and private', 'Constructors', 'Methods', 'Protecting your data'], L => {
    const b = bench(L, '#include <iostream>\nusing namespace std;\n\n');
    b.type('class PiggyBank {\n    int coins = 0;\npublic:\n    void add(int n) {\n        if (n > 0) coins += n;\n    }\n    int total() const { return coins; }\n};\n\nint main() {\n    PiggyBank bank;\n    bank.add(5);\n    bank.add(-100);\n    cout << bank.total() << " coins" << endl;\n    return 0;\n}', { cps: 26, say: 'A *class* bundles data and actions. Its functions are called *methods*.' });
    b.callout({ code: 'int coins = 0;' }, 'private: hidden inside', { side: 'right', dist: 60, dur: 4.6, wait: false });
    b.callout({ code: 'public:' }, 'anyone can use these', { side: 'right', dist: 60, delay: 1.2, dur: 3.4, wait: false, color: 'var(--c-val)' });
    L.say('*coins* is *private*: only the class itself can change it. The *public* methods are the way in.', { dur: 4.8 });
    b.run({ say: 'The -100 is refused by the check in *add*. The class protects its own data!' });
    L.say('A *constructor* sets up each new object. Watch one being made:');
    b.stepper('cpp/12/0', { each: 2.8 });
    L.remember([
      '`class` = data + methods, in one bundle.',
      '`private` data is hidden; `public` methods are the way in.',
      'A constructor sets up each new object.',
      '`const` methods promise not to change the object.'
    ]);
  });

  /* ============================== 13 Inheritance ============================== */
  lesson('13', 'Inheritance', 'polish', 'virtual', ['Base and derived classes', 'virtual and override', 'Calling the parent', 'Abstract classes'], L => {
    const b = bench(L, '#include <iostream>\nusing namespace std;\n\n');
    b.type('class Animal {\npublic:\n    virtual void speak() { cout << "..." << endl; }\n};\n\nclass Dog : public Animal {\npublic:\n    void speak() override { cout << "Woof!" << endl; }\n};\n\nclass Cat : public Animal {\npublic:\n    void speak() override { cout << "Meow!" << endl; }\n};\n\nint main() {\n    Dog rex;\n    Cat tom;\n    Animal* pets[] = {&rex, &tom};\n    for (Animal* a : pets) a->speak();\n    return 0;\n}', { cps: 30, say: '*Inheritance*: a class based on another one. A Dog *is an* Animal.' });
    b.callout({ code: ': public Animal' }, 'based on Animal', { side: 'right', dist: 40, dur: 4, wait: false, occ: 0 });
    L.say('*Dog* and *Cat* get everything Animal has, and can change what they need.', { dur: 4.2 });
    b.callout({ code: 'override', occ: 0 }, 'Dog\'s own version', { side: 'bottom', dist: 60, say: '*virtual* in Animal and *override* here let each kind of animal answer in its own way.' });
    b.run({ pause: 0.4 });
    L.remember([
      '`class Dog : public Animal { };`',
      'The derived class gets everything the base has.',
      '`virtual` in the base, `override` in the derived.',
      'One loop can treat many kinds of things alike.'
    ]);
  });

  /* ============================== 14 The Standard Library ============================== */
  lesson('14', 'The Standard Library', 'polish', 'map', ['map', 'set', 'sort and algorithms', 'Lambdas'], L => {
    const b = bench(L, MAIN('    map<string, int> votes;\n    votes["pizza"]++;\n    votes["tacos"]++;\n    votes["pizza"]++;\n\n    for (auto& [food, n] : votes) {\n        cout << food << ": " << n << endl;\n    }', '#include <iostream>\n#include <map>\n#include <string>'));
    L.say('C++ comes with a huge toolbox called the *Standard Library*.');
    b.run({ say: 'A *map* looks things up by a key, like a dictionary. Here it counts votes.' });
    b.set({ 'main.cpp': MAIN('    vector<int> v = {72, 95, 88, 64};\n    sort(v.begin(), v.end());\n    for (int x : v) cout << x << " ";\n    cout << endl;\n\n    sort(v.begin(), v.end(), [](int a, int b) {\n        return a > b;\n    });\n    cout << "Best: " << v[0] << endl;', '#include <iostream>\n#include <vector>\n#include <algorithm>') });
    b.callout({ code: '[](int a, int b)' }, 'a lambda: a tiny function', { side: 'right', dist: 60, say: '*sort* puts things in order. A *lambda* is a tiny function that tells it how.' });
    b.run({ pause: 0.4 });
    L.remember([
      '`map<string, int>`: look up by key.',
      '`set<T>`: every value only once.',
      '`#include <algorithm>`: `sort`, `find`, `count`...',
      'Lambdas: `[](int a, int b) { return a > b; }`'
    ]);
  });

  /* ============================== 15 Real Programs ============================== */
  lesson('15', 'Real Programs', 'polish', 'g++', ['Random numbers', 'Smart pointers', 'Header files', 'Compiling on your computer'], L => {
    const b = bench(L, MAIN('    mt19937 rng(42);\n    uniform_int_distribution<int> dice(1, 6);\n\n    for (int i = 0; i < 10; i++) {\n        cout << dice(rng) << " ";\n    }\n    cout << endl;', '#include <iostream>\n#include <random>'));
    L.say('Games need dice. *<random>* has a generator and a distribution: "a number from 1 to 6".');
    b.run({ pause: 0.4 });
    L.say('Real programs also make objects while running. *Smart pointers* clean them up automatically, so memory is never wasted.');
    L.html(`<div class="center"><div data-pop style="width:1300px;border-radius:30px;background:#1B1930;color:#E8E7F1;padding:40px 50px;font-family:var(--font-code);font-size:40px;line-height:1.7;box-shadow:0 30px 70px rgba(27,25,48,.25)">
      <div style="color:#8B88A4;font-size:28px;margin-bottom:10px">Terminal</div>
      <div data-pop data-at="0.6"><span style="color:#7FD8BE">$</span> g++ -std=c++20 main.cpp -o game</div>
      <div data-pop data-at="1.6"><span style="color:#7FD8BE">$</span> ./game</div>
      <div data-pop data-at="2.4" style="color:#FFB86B">Welcome to the arena! 🤖</div></div></div>`);
    L.say('On your own computer, you compile with one command in the *terminal*, then run your program.', { pause: 0.6 });
    L.remember([
      '`mt19937 rng(seed);` and `uniform_int_distribution`.',
      'Use `make_unique` instead of `new` and `delete`.',
      'Split big programs into `.h` and `.cpp` files.',
      'Compile: `g++ -std=c++20 main.cpp -o app`'
    ]);
  });

  /* ============================== 16 Final Project ============================== */
  lesson('16', 'Final Project', 'build', 'game', ['Planning a program', 'A base class and three robots', 'The battle loop', 'Making it yours'], L => {
    const b = bench(L, CODE('16/Robot Arena'), { font: 17, edWidth: 860, scrollCode: 0 });
    L.say('In the final project, you build *Robot Arena*: pick a robot, and watch it battle a random opponent.');
    b.run({ stdin: '3\n7', lineTime: 0.06, say: 'Round by round, with health bars and special attacks, until one robot is left standing.' });
    L.wait(1.5);
    const steps = ['The plan', 'The dice', 'The Robot base class', 'Three kinds of robots', 'Making robots with smart pointers', 'The battle loop'];
    L.html(`<div style="position:absolute;left:330px;right:330px;top:150px;display:grid;gap:18px">${steps.map((s, i) =>
      `<div data-pop style="display:flex;gap:24px;align-items:center;background:#fff;border:2px solid var(--line);border-radius:28px;padding:18px 28px">
        <span style="flex:none;width:66px;height:66px;border-radius:20px;background:var(--ink);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:36px">${i + 1}</span>
        <span style="font-family:var(--font-display);font-weight:800;font-size:38px;letter-spacing:-.01em">${s}</span></div>`).join('')}</div>`, { gap: 0.5 });
    L.say('You build it in six steps, with classes, inheritance, virtual functions, smart pointers and random numbers.', { pause: 1 });
    L.say('Then make it *yours*: invent new robots, new attacks and new rules!', { pause: 0.6 });
  });

  /* ============================== The end ============================== */
  V.part({ group: 'basics' }, L => {
    L.big('You can <em>code</em> in C++! 🎉', 'Now open the course and try every example yourself.<br>Change the code, break things, and have fun.', { dur: 6 });
    L.cards([
      { ic: '&lt;/&gt;', title: 'HTML & CSS', text: 'Build your own websites.', color: 'var(--c-tag)' },
      { ic: 'py', title: 'Python', text: 'Programs that talk, decide and draw.', color: 'var(--c-prop)' },
      { ic: 'TS', title: 'TypeScript', text: 'Make web pages come alive.', color: 'var(--c-attr)' }
    ], { gap: 0.6, hold: 0 });
    L.say('Want more? Hello Courses also has *HTML*, *Python* and *TypeScript*. See you there!', { pause: 1 });
    L.html(`<div class="center"><div style="display:grid;justify-items:center;gap:30px">
        <div data-pop data-at="0.2" class="logo-mark" style="width:150px;height:150px;border-radius:44px;font-size:52px">c++</div>
        <div data-pop data-at="0.6" class="big-title" style="font-size:120px">Hello <em>C++</em></div>
        <div data-pop data-at="1.0" class="sub">Thanks for watching!</div></div></div>`, { dur: 5 });
  });

  V.finish();
})();
