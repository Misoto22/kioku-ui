/** The component library index, in English. */
export const componentsEn = {
  accessibility: {
    audit: (skins: number) =>
      `Every story is audited with axe across all ${skins} themes in both colour modes, fingerprinted against a committed baseline.`,
    label: 'ACCESSIBILITY',
  },
  empty: {
    clearSearch: 'Clear search',
    detailInGroup:
      'Nothing in this group answers to that. Try a shorter word, or widen the index to every group.',
    detailOverall: 'Try a shorter word, or clear the search to see everything.',
    showEveryGroup: 'Show every group',
    title: 'Nothing matches that',
  },
  everything: 'Everything',
  groupMenu: (group: string) => `${group} components`,
  // The catalogue's own titles, so the English page is the identity map.
  groups: {
    Action: 'Action',
    Chat: 'Chat',
    Container: 'Container',
    Content: 'Content',
    'Data input': 'Data input',
    'Feedback & status': 'Feedback & status',
    Layout: 'Layout',
    Navigation: 'Navigation',
    Overlay: 'Overlay',
    'Table & list': 'Table & list',
    Utility: 'Utility',
  },
  groupsLabel: 'COMPONENT GROUPS',
  inLibrary: {
    label: 'IN THE LIBRARY',
    note: 'components, none planned and none stubbed. Every one carries its own documentation, tests, and a Storybook story.',
  },
  intro:
    'Grouped the way a reader looks for things rather than the way the source is laid out — the group names and their order mirror the reference system this library is aligned with, so anyone moving between the two finds the same component in the same place.',
  matches: (count: number, query: string) =>
    `${count} ${count === 1 ? 'match' : 'matches'} for “${query}”`,
  openStorybook: 'Open Storybook',
  search: 'Search components',
  shown: {
    lead: '',
    ofTotal: ' of ',
    thenGroups: ' shown · ',
    tail: (groups: number) => (groups === 1 ? ' group' : ' groups'),
  },
  startHere: 'START HERE',
  title: 'Browse the library',
};
