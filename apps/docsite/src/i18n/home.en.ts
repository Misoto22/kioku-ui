/**
 * The landing page in English.
 *
 * It argues from what the library is — a product-neutral design system — and
 * spends its width saying so. The Chinese page argues from what the library
 * will and will not touch in your repository, which takes fewer glyphs and
 * leaves room for a band this page has no space for.
 */
export const homeEn = {
  actions: {browse: 'Browse components', start: 'Get started'},
  badge: 'Currently unreleased',
  builtOn: {
    lead: 'Built on React ',
    link: 'StyleX',
    mid: ' and ',
    tail: '',
    version: '19',
  },
  facts: {
    components: {
      detail: 'Layout, controls, data, state, chat, and overlays.',
      label: 'components',
    },
    templates: {
      detail: 'Copied into your repository as source you own.',
      label: 'page templates',
    },
    themes: {
      detail: (names: readonly string[]) =>
        `${names.join(', ')}, in light and dark.`,
      label: 'themes',
    },
    tokens: {
      detail: (groups: number) => `${groups} groups, validated at runtime.`,
      label: 'semantic tokens',
    },
  },
  headline: 'A product-neutral React design system',
  lead: {
    after: '.',
    before:
      'Components, semantic tokens, themes, and build tooling. It ships no routes, no APIs, no data, and no business logic — those stay ',
    emphasis: 'yours',
  },
  palette: {
    body: 'Ten values, three of them ink at three ranks. Indigo does the focus ring, the selection rule, and the link — always a line, never an area.',
    eyebrow: 'The whole palette',
    heading: 'Paper and ink, and one blue',
    roles: {
      accent: 'Indigo',
      ground: 'Ground',
      hairline: 'Hairline',
      hover: 'Hover wash',
      ink: 'Ink',
      muted: 'Third rank',
      paper: 'Paper',
      secondary: 'Second rank',
      strong: 'Strong edge',
      sunken: 'Sunken',
    },
  },
  preview: {
    columns: {
      component: 'Component',
      description: 'Description',
      status: 'Status',
    },
    count: {lead: '', tail: ' components'},
    groups: 'Groups',
    layout: {cards: 'Cards', label: 'Preview layout', table: 'Table'},
    note: {
      lead: 'Everything above is in the box: ',
      tail: '. Nothing was drawn for this page.',
    },
    status: {planned: 'Planned', ready: 'Ready'},
  },
  selection: {
    body: 'The fill wins the eye and loses the row: the type inverts, the sheet is interrupted, and the two rows that were never in question are demoted to background. The mark costs two pixels and takes nothing away.',
    eyebrow: 'Rule four',
    heading: 'Selection is a mark, never a fill',
    verdict: {no: 'Not this', yes: 'This'},
  },
  unreleased:
    'No version has been published to npm yet. Until the first Changesets release runs, consume the packages through the workspace.',
};
