/** One template's page, in English. */
export const templateDetailEn = {
  composes: {
    argument: {
      emphasis: 'arrangement',
      lead: "Read off the template's own imports rather than recorded by hand, so the list cannot drift from the file below it. Everything here ships in the package: a template adds ",
      tail: ', not components.',
    },
    figure: {
      lead: '',
      tail: (imports: number) =>
        ` ${imports === 1 ? 'import' : 'imports'} from @misoto22/kioku-ui`,
    },
    label: 'COMPOSES',
    menu: (title: string) => `Components ${title} composes`,
    unlisted: {
      label: 'NO PAGE OF THEIR OWN',
      tail: 'Sub-parts, hooks and types are exported from the same package but indexed under the component they belong to.',
    },
  },
  copyItIn: {
    between: ' to write it somewhere else, and ',
    dest: '--dest',
    force: '--force',
    label: 'COPY IT IN',
    lead: 'Writes ',
    middle: ' into the working directory. Pass ',
    tail: ' to overwrite a file that is already there.',
  },
  notFound: {
    action: 'Back to the gallery',
    detail:
      'Nothing in the catalogue answers to that id. It may have been renamed, or the link may have been typed by hand.',
    title: 'No such template',
  },
  otherCategories: {
    label: 'OTHER CATEGORIES',
    menu: 'Other template categories',
  },
  planned: 'planned',
  preview: {
    label: 'PREVIEW',
    note: "The template itself, rendered from the same file the source below prints — not a picture of it, and not a second copy that could drift. It is a preview rather than a demonstration: nothing inside answers to the pointer or the keyboard, and it takes neither the page's focus nor its scroll.",
    scale: '% · not interactive',
  },
  reserved: {
    action: 'Back to the gallery',
    lead: 'The id ',
    middle:
      ' is held so the catalogue and the CLI agree on what this template will be called, but the page has not been written. There is nothing to copy in yet: ',
    tail: ' would find nothing today. The gallery lists everything that is written.',
    title: 'Reserved, not written yet',
  },
  shape: {
    label: 'SHAPE',
    note: 'The regions the page is divided into, and what fills the main one. This template cannot be rendered inline, so the drawing the gallery card carries stands in for it.',
  },
  source: {
    between: ' · ',
    label: 'SOURCE',
    lines: (lines: number) => (lines === 1 ? ' line' : ' lines'),
    note: 'The whole file, as the CLI writes it. There is no build step and no hidden half: what you read here is what lands in your repository.',
  },
  status: {planned: 'Planned', ready: 'Ready'},
};
