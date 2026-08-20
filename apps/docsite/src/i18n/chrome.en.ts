/** The banner and the footer, in English. */
export const chromeEn = {
  appearance: {
    label: 'Appearance',
    options: {dark: 'Dark', light: 'Light', system: 'System'},
    trigger: (value: string) => `Appearance: ${value}`,
  },
  destinations: {
    components: 'Components',
    docs: 'Docs',
    templates: 'Templates',
    themes: 'Themes',
  },
  footer: {issues: 'Report an issue', release: 'Release runbook'},
  language: {
    label: 'Language',
    trigger: (value: string) => `Language: ${value}`,
  },
  navigation: {open: 'Open navigation', primary: 'Primary'},
  repository: 'GitHub',
  skin: {label: 'Skin', trigger: (value: string) => `Skin: ${value}`},
};
