/**
 * The themes page in English.
 *
 * The fourth skin is the reason this page has prose at all. Three skins can be
 * shown with a swatch and a hex; the glass one has no hex to show, so the row
 * has to say what a tint is and the page has to name the three facts that
 * make it one.
 */
export const themesEn = {
  appearance: {
    dark: 'Dark',
    label: 'APPEARANCE',
    light: 'Light',
    system: 'System',
  },
  density: {compact: 'Compact', label: 'DENSITY', standard: 'Standard'},
  eyebrow: 'TOKEN CONTRACT',
  glass: {
    backdrops: {
      detail:
        'Every tinted chip is split down the middle and drawn over both of these. A flat backdrop blurs to itself, so each half is exact arithmetic rather than an impression.',
      label: 'THE BACKDROPS',
    },
    blur: {
      label: 'THE BLUR',
      lead: 'A separate fact on a separate element — ',
      tail: ' on the theme root’s ::before. It works on whatever the host drew behind the app, and a flat backdrop blurs to itself — which is why the composites above are arithmetic a reader can check rather than an impression.',
    },
    label: 'THE FOURTH SKIN',
    lever: {
      label: 'THE LEVER',
      lead: '',
      tail: ' — at 100% this is an ordinary near-white skin, at 0% it is bare backdrop.',
    },
    rule: 'A role whose value depends on the backdrop is drawn as a relationship; a role that does not is drawn as a value. Either way the row keeps its six columns, so the fourth skin sits beside the other three without a special case.',
    tint: {
      label: 'THE TINT',
      lead: 'Ground and sunken keep the share of their own colour the lever sets; a raised surface clamps higher, to ',
      tail: ' — which is where muted text still holds AA over a backdrop of pure black or pure white.',
    },
  },
  groups: {
    count: (groups: number) => `${groups} groups`,
    label: 'ROLE GROUPS',
    note: 'a skin that leaves one role unfilled is not a theme',
    total: 'total',
  },
  lead: 'A theme fills every role in the token contract for one visual identity. Components never name a colour, so switching one changes everything below without touching a component.',
  sample: {
    cancel: 'Cancel',
    label: (skin: string) => `THE SAME PAGE, DRESSED BY ${skin}`,
    live: 'Live updates',
    liveNote: 'Applies as soon as it is flipped',
    note: 'ordinary furniture, because a skin is only convincing against what it will actually dress',
    owner: 'Owner',
    publish: 'Publish',
    release: (index: number) => `Release ${index}`,
    releaseTitle: 'Release title',
    releasesHeading: 'Recent releases',
    status: 'Status',
    version: 'Release',
  },
  skins: {
    inUse: 'IN USE',
    label: 'SKINS',
    note: (skins: number, roles: number) =>
      `all ${skins} fill every one of the ${roles} roles; the sample below is dressed by the marked skin`,
    notes: {
      kasumi:
        'A near-white tint and a real blur — the one skin that expects something behind it.',
      muji: 'Cool walls, light timber where you touch it, a green-grey accent.',
      sumi: 'High contrast, near monochrome, one indigo accent, no grain.',
      washi: 'Warm paper and sumi ink, with indigo, moss, kerria and madder.',
    },
    roles: {
      accent: 'ACCENT',
      edge: 'EDGE',
      ground: 'GROUND',
      ink: 'INK',
      paper: 'PAPER',
      sunken: 'SUNKEN',
    },
    solidFooter: (roles: number) =>
      `${roles} roles, ${roles} values — not one of them depends on what is drawn behind.`,
    tintFooter: {
      emphasis: 'tint',
      lead: (tints: number) => `${tints} of the six give a `,
      tail: ' rather than a value: each half is that tint over the backdrop above it.',
    },
    valueChip: 'A VALUE, NOT A TINT',
  },
  spacingLabel: 'SPACING',
  statuses: {open: 'Open', published: 'Published', review: 'In review'},
  title: 'Themes',
  type: {
    label: 'TYPE SCALE',
    note: 'tracking runs inverse to size — the smaller the type, the further it opens, and every cell is set with its own pair',
    roles: {
      body: 'Body',
      eyebrow: 'Eyebrow',
      label: 'Label',
      pageTitle: 'Page title',
      section: 'Section',
      subsection: 'Subsection',
    },
  },
};
