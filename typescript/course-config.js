/* Hello TypeScript: the list of lessons. The course engine (assets/course.js) reads this. */
window.COURSE = {
  name: 'Hello TypeScript',
  logo: 'ts',
  storageKey: 'hello-typescript:done',
  siteRoot: '..',
  groups: {
    basics: { name: 'First steps', color: '--c-tag' },
    style: { name: 'Decisions & loops', color: '--c-prop' },
    parts: { name: 'Data', color: '--c-attr' },
    layout: { name: 'Functions & types', color: '--c-val' },
    polish: { name: 'The web & beyond', color: '--c-sel' },
    build: { name: 'Build', color: '--ink' }
  },
  lessons: [
    { id: '00-start-here', title: 'Start Here', chip: 'hello', group: 'basics', blurb: 'What JavaScript and TypeScript are, and how this course works.' },
    { id: '01-console', title: 'Your First Program', chip: 'console.log', group: 'basics', blurb: 'Show things on screen, and meet your first type error.' },
    { id: '02-variables', title: 'Variables & Types', chip: 'let x: number', group: 'basics', blurb: 'let, const, and the types that keep your values safe.' },
    { id: '03-numbers', title: 'Numbers & Math', chip: '2 + 2', group: 'basics', blurb: 'Math operators, rounding and the Math toolbox.' },
    { id: '04-strings', title: 'Text (Strings)', chip: '`${x}`', group: 'basics', blurb: 'Template strings, slicing and text methods.' },
    { id: '05-if', title: 'Making Decisions', chip: 'if', group: 'style', blurb: 'if, else, switch and the === operator.' },
    { id: '06-loops', title: 'Loops', chip: 'for', group: 'style', blurb: 'for, while and for...of: repeat without copying.' },
    { id: '07-arrays', title: 'Arrays', chip: 'string[]', group: 'parts', blurb: 'Lists of values: push, map, filter and friends.' },
    { id: '08-objects', title: 'Objects & Interfaces', chip: 'interface', group: 'parts', blurb: 'Group related values, and describe their shape with types.' },
    { id: '09-functions', title: 'Functions', chip: '=>', group: 'layout', blurb: 'Typed parameters, return values and arrow functions.' },
    { id: '10-types', title: 'Smarter Types', chip: 'A | B', group: 'layout', blurb: 'Unions, literal types, null and narrowing.' },
    { id: '11-classes', title: 'Classes', chip: 'class', group: 'layout', blurb: 'Blueprints for objects, with private parts.' },
    { id: '12-generics', title: 'Generics & Collections', chip: '<T>', group: 'layout', blurb: 'Reusable types, Map and Set.' },
    { id: '13-dom', title: 'TypeScript + Web Pages', chip: 'document', group: 'polish', blurb: 'Make HTML pages interactive: clicks, typing and changing the page.' },
    { id: '14-async', title: 'Waiting: Timers & async', chip: 'await', group: 'polish', blurb: 'Timers, promises and async/await.' },
    { id: '15-real-projects', title: 'Real Projects', chip: 'npm', group: 'polish', blurb: 'Modules, the compiler, npm and how real apps are set up.' },
    { id: '16-final-project', title: 'Final Project', chip: 'app', group: 'build', blurb: 'Build a colorful, working to-do app in TypeScript.' }
  ]
};
