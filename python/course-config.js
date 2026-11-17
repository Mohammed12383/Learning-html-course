/* Hello Python: the list of lessons. The course engine (assets/course.js) reads this. */
window.COURSE = {
  name: 'Hello Python',
  logo: 'py',
  storageKey: 'hello-python:done',
  siteRoot: '..',
  groups: {
    basics: { name: 'First steps', color: '--c-tag' },
    style: { name: 'Decisions & loops', color: '--c-prop' },
    parts: { name: 'Collections', color: '--c-attr' },
    layout: { name: 'Functions & objects', color: '--c-val' },
    polish: { name: 'Fun & real world', color: '--c-sel' },
    build: { name: 'Build', color: '--ink' }
  },
  lessons: [
    { id: '00-start-here', title: 'Start Here', chip: 'hello', group: 'basics', blurb: 'What programming is, how this course works, and how to run Python yourself.' },
    { id: '01-print', title: 'Your First Program', chip: 'print()', group: 'basics', blurb: 'Make the computer talk, and learn to read error messages.' },
    { id: '02-variables', title: 'Variables', chip: 'x = 5', group: 'basics', blurb: 'Boxes with names that remember things for you.' },
    { id: '03-numbers', title: 'Numbers & Math', chip: '2 + 2', group: 'basics', blurb: 'Python as a super calculator: + − × ÷ and more.' },
    { id: '04-strings', title: 'Text (Strings)', chip: '"abc"', group: 'basics', blurb: 'Join, slice, change and format text.' },
    { id: '05-input', title: 'Asking Questions', chip: 'input()', group: 'basics', blurb: 'Let people type answers into your program.' },
    { id: '06-if', title: 'Making Decisions', chip: 'if', group: 'style', blurb: 'if, elif and else: do different things in different situations.' },
    { id: '07-for', title: 'Loops with for', chip: 'for', group: 'style', blurb: 'Repeat things without copying code.' },
    { id: '08-while', title: 'Loops with while', chip: 'while', group: 'style', blurb: 'Keep going until something happens. Build a guessing game.' },
    { id: '09-lists', title: 'Lists', chip: '[ ]', group: 'parts', blurb: 'Keep many things in order in one variable.' },
    { id: '10-dicts', title: 'Dictionaries', chip: '{ }', group: 'parts', blurb: 'Look things up by name, like a real dictionary.' },
    { id: '11-functions', title: 'Functions', chip: 'def', group: 'layout', blurb: 'Make your own commands that you can reuse.' },
    { id: '12-errors', title: 'Errors & Debugging', chip: 'try', group: 'layout', blurb: 'Read error messages, find bugs and handle problems.' },
    { id: '13-classes', title: 'Classes & Objects', chip: 'class', group: 'layout', blurb: 'Create your own types of things, with data and actions.' },
    { id: '14-turtle', title: 'Drawing with Turtle', chip: 'turtle', group: 'polish', blurb: 'Draw shapes, spirals and art with code.' },
    { id: '15-modules', title: 'Modules: random, math & more', chip: 'import', group: 'polish', blurb: 'Use ready-made tools: dice, time, math and more.' },
    { id: '16-final-project', title: 'Final Project', chip: 'game', group: 'build', blurb: 'Build Pocket Pet, a complete little game.' }
  ]
};
