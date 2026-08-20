/**
 * The template gallery, in Chinese.
 *
 * A template's id is what the CLI answers to, so it stays Latin wherever it
 * appears — including inside the command, which is not prose at all.
 */
import {quarter} from './locale.js';

export const templatesZh = {
  categories: {
    'AI chat': `AI${quarter}对话`,
    All: '全部',
    Content: '内容',
    Form: '表单',
    Gallery: '图库',
    Login: '登录',
    Settings: '设置',
    Shell: '外壳',
    Table: '表格',
    Tools: '工具',
  },
  categoryLabel: '模板分类',
  command: 'kioku-ui add pages <id>',
  copyOneIn: '抄一份进来',
  counts: {inCatalogue: '在目录里', planned: '计划中', ready: '就绪'},
  eyebrow: '模板画廊',
  intro: `整页整页抄进你的仓库，落地就是你自己的源码，不是${quarter}import${quarter}进来的黑盒。`,
  planned: {
    label: '计划中',
    note: `id${quarter}已经占住，页面还没写——列出来，是因为藏起来会让这套目录显得比实际小`,
  },
  ready: {label: '就绪', note: '今天就能写进你的仓库'},
  title: '模板',
};
