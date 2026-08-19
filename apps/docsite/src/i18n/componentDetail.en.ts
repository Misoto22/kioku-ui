/** One component's page, in English. */
export const componentDetailEn = {
  breadcrumbRoot: 'Components',
  example: {
    label: 'EXAMPLE',
    none: 'No documented example.',
    note: 'The shortest thing that works. Every prop is optional unless the table above says otherwise.',
  },
  inherited: {
    label: 'INHERITED',
    tail: 'The package owns its own styling, so a caller cannot reach in and override it.',
  },
  noSidecar: {
    lead: (name: string) =>
      `${name} ships no documentation sidecar to this site, so its props are not listed here. The type is the contract: import it and read `,
    tail: '.',
  },
  noSpecimen: {
    detail: (name: string, skins: number) =>
      `No specimen is registered for ${name} yet. Its story draws every state it has, audited with axe across all ${skins} themes in both colour modes.`,
    title: 'No specimen registered',
  },
  noTypeColumn: {
    label: 'NO TYPE COLUMN',
    lead: 'The documentation sidecar records three things: a name, whether it is required, and what it does. Type and default are not set a second time here — the type is ',
    tail: ', and a copy of it on this page could only ever be the stale one.',
  },
  notFound: {
    action: 'Back to the library',
    detail:
      'Nothing in the catalogue answers to that name. It may have been renamed, or the link may have been typed by hand.',
    title: 'No such component',
  },
  openStory: 'Open story',
  otherGroups: {label: 'OTHER GROUPS', menu: 'Other component groups'},
  props: {
    description: 'Description',
    figure: {
      between: ' own · ',
      lead: '',
      tail: (inherited: number) =>
        ` inherited ${inherited === 1 ? 'set' : 'sets'}`,
    },
    label: 'PROPS',
    name: 'Prop',
    optional: 'Optional',
    required: 'Required',
    requiredColumn: 'Required',
  },
  specimen: {label: 'SPECIMEN', themeLabel: 'Specimen theme'},
  status: {planned: 'Planned', ready: 'Ready'},
  stories: {
    label: 'STORIES',
    none: (name: string) => `No story is registered for ${name}.`,
    note: (skins: number) =>
      `The story draws every state it has, audited with axe across all ${skins} themes, in both colour modes.`,
    open: 'Open',
  },
  viewSource: 'View source',
};
