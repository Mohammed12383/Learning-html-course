/* Hello C++: the list of lessons. The course engine (assets/course.js) reads this. */
window.COURSE = {
  name: 'Hello C++',
  logo: 'c++',
  storageKey: 'hello-cpp:done',
  siteRoot: '..',
  groups: {
    basics: { name: 'First steps', color: '--c-tag' },
    style: { name: 'Decisions & loops', color: '--c-prop' },
    parts: { name: 'Collections', color: '--c-attr' },
    layout: { name: 'Functions & memory', color: '--c-val' },
    polish: { name: 'Objects & power tools', color: '--c-sel' },
    build: { name: 'Build', color: '--ink' }
  },
  lessons: [
    { id: '00-start-here', title: 'Start Here', chip: 'hello', group: 'basics', blurb: 'What C++ is, what a compiler does, and how this course works.' },
    { id: '01-hello', title: 'Hello, World!', chip: 'cout <<', group: 'basics', blurb: 'Your first program, line by line, and your first compile error.' },
    { id: '02-variables', title: 'Variables & Types', chip: 'int x', group: 'basics', blurb: 'Boxes in memory: int, double, char, bool and string.' },
    { id: '03-math', title: 'Math', chip: '7 / 2', group: 'basics', blurb: 'Operators, the integer division surprise, and <cmath>.' },
    { id: '04-input', title: 'Input with cin', chip: 'cin >>', group: 'basics', blurb: 'Read numbers and words that the user types.' },
    { id: '05-if', title: 'Making Decisions', chip: 'if', group: 'style', blurb: 'if, else, switch and logical operators.' },
    { id: '06-loops', title: 'Loops', chip: 'for', group: 'style', blurb: 'for, while and do-while. Draw patterns with nested loops.' },
    { id: '07-vectors', title: 'Arrays & Vectors', chip: 'vector<int>', group: 'parts', blurb: 'Lists of values, and why vectors are your best friend.' },
    { id: '08-strings', title: 'Strings', chip: 'string', group: 'parts', blurb: 'Work with text: join, search, cut and change it.' },
    { id: '09-functions', title: 'Functions', chip: 'int f()', group: 'layout', blurb: 'Reusable code, and passing by value vs by reference.' },
    { id: '10-pointers', title: 'Memory & Pointers', chip: '*p', group: 'layout', blurb: 'Addresses, pointers and references, drawn as pictures.' },
    { id: '11-structs', title: 'Structs', chip: 'struct', group: 'layout', blurb: 'Group related values into your own type.' },
    { id: '12-classes', title: 'Classes', chip: 'class', group: 'polish', blurb: 'Objects with private data, constructors and methods.' },
    { id: '13-inheritance', title: 'Inheritance', chip: 'virtual', group: 'polish', blurb: 'Classes built on other classes, and virtual functions.' },
    { id: '14-stl', title: 'The Standard Library', chip: 'map', group: 'polish', blurb: 'map, set, sort, and other ready-made power tools.' },
    { id: '15-real-programs', title: 'Real Programs', chip: 'g++', group: 'polish', blurb: 'Smart pointers, files, headers and compiling on a computer.' },
    { id: '16-final-project', title: 'Final Project', chip: 'game', group: 'build', blurb: 'Build Robot Arena, a battle game with classes and random.' }
  ]
};
