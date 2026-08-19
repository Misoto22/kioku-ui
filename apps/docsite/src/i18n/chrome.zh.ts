/**
 * The banner and the footer, in Chinese.
 *
 * The triggers part their label from their value with a full-width colon.
 * `：` already carries its own em, so nothing follows it — a Latin space after
 * full-width punctuation opens a gap wide enough to read as a paragraph break.
 */
export const chromeZh = {
  appearance: {
    label: '外观',
    options: {dark: '深色', light: '浅色', system: '跟随系统'},
    trigger: (value: string) => `外观：${value}`,
  },
  destinations: {
    components: '组件',
    docs: '文档',
    templates: '模板',
    themes: '主题',
  },
  footer: {issues: '提交问题', release: '发布手册'},
  language: {label: '语言', trigger: (value: string) => `语言：${value}`},
  navigation: {open: '打开导航', primary: '主导航'},
  repository: 'GitHub',
  skin: {label: '皮肤', trigger: (value: string) => `皮肤：${value}`},
};
