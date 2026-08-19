/**
 * The getting-started page in English.
 *
 * Every step answers the same three questions in the same order — what it is
 * for, what breaks without it, and what tells you it landed — because a
 * reader who has just typed a command wants the third one and nothing else.
 */
export const docsEn = {
  eyebrow: 'GETTING STARTED',
  exit: {
    components: 'Browse components',
    templates: 'Browse templates',
    terminal: {
      lead: 'Or take it from the terminal — ',
      tail: ' writes the files into the working directory.',
    },
  },
  factLabels: {skip: 'IF YOU SKIP IT', worked: 'IT WORKED WHEN'},
  lead: 'Four steps from an empty app to a themed one — why each exists, and what tells you it landed.',
  notice: {
    detail:
      'No version is published to npm yet. Until the first release, consume the packages through the workspace.',
    label: 'UNRELEASED',
  },
  rail: {
    done: {
      fonts: 'font families',
      imports: 'css imports',
      label: 'WHEN YOU ARE DONE',
      packages: 'packages',
      providers: 'providers',
      roles: 'token roles filled',
    },
    labour: {
      detail:
        'The library supplies components, tokens, and themes. Your application keeps its routes, its data, and its language.',
      label: 'THE DIVISION OF LABOUR',
    },
    never: {
      items: [
        'Route, fetch, or persist anything.',
        'Name a product, a domain concept, or a page.',
        'Ship font files, or decide your copy.',
        'Hard-code a theme, or store which one you chose.',
      ],
      label: 'WHAT IT WILL NOT DO',
    },
    stepsLabel: 'FOUR STEPS',
  },
  steps: {
    fonts: {
      caption: 'DOCUMENT HEAD',
      note: {
        detail: 'Shippori Mincho, Zen Kaku Gothic New, IBM Plex Mono.',
        label: 'THE THREE FAMILIES',
      },
      skip: 'Nothing errors — the Mincho voice simply stops arriving.',
      summary:
        'The themes name font families but ship no font files — that is a host’s decision. These three are the families the kioku pack names; without them everything falls back to the system UI font.',
      title: 'Load the fonts',
      worked: 'An eyebrow sets in Mincho; figures line up on the digit.',
    },
    install: {
      caption: 'TERMINAL',
      skip: (roles: number) =>
        `Components alone: all ${roles} roles resolve to nothing.`,
      summary:
        'Two packages: the components, and one theme pack. The pack is what gives every token a value, so a build with the components alone renders unpainted.',
      title: 'Install',
      worked: 'Both names sit in node_modules and theme.css resolves.',
    },
    page: {
      caption: 'THREE KINDS',
      summary:
        'Start from a template rather than an empty file. The CLI copies the source into your repository, where you own it and can change it without waiting on a release.',
      title: 'Build a page',
      worked: 'The copied page builds against the theme set in step 02.',
    },
    provider: {
      caption: 'APPLICATION ROOT',
      note: {
        detail: 'reset, then styles, then the theme — the theme wins last.',
        label: 'THE IMPORTS ARE ORDERED',
      },
      skip: 'No data-theme root, so every token falls back to nothing.',
      summary:
        'The provider writes the chosen theme’s tokens onto one element, and every component below it reads them from there. The host supplies the theme list and the default id; the library owns no storage and hard-codes no theme.',
      title: 'Wrap the application',
      worked: 'The wrapper carries data-theme="washi" and data-density.',
    },
  },
  title: 'Get started',
  wrapNote: {
    lead: 'The ',
    tail: ' prop, because the href outruns any column this page could give it. A continuation is set in one step, so it can never be misread as the next line of source.',
  },
};
