import {quarter} from './locale.js';

/**
 * The landing page in Chinese. Written, not translated.
 *
 * The English page argues that this is a product-neutral React design system.
 * A Chinese-reading engineer wants first to know what it will and will not
 * touch inside their repository, and wants it in two four-beat clauses — so
 * the headline is 只做组件，不碰业务 and the page goes on to answer the
 * question that raises: who is checking? That band, 边界, has no counterpart
 * in English, which spent the same room on longer words.
 *
 * Punctuation is full width and nothing follows it: ，。、：—— each already
 * own their em, and a Latin space after one opens a gap that reads as a break.
 * A Latin word or numeral inside a Chinese line is parted by `quarter` on both
 * sides, since Chinese sets no word space of its own for it to borrow.
 */
export const homeZh = {
  actions: {browse: '浏览组件', start: '开始使用'},
  badge: '尚未发布',
  boundaries: {
    command: 'pnpm check:package-boundaries',
    eyebrow: '边界',
    heading: '边界不是写出来的，是跑出来的',
    lead: '核心源码只要犯了下面任何一条，这道闸就让构建失败：',
    rejections: [
      '引用宿主应用的路径',
      '点名某一套皮肤',
      `写死默认主题${quarter}id`,
      `伸手去拿${quarter}localStorage`,
    ],
  },
  builtOn: {
    lead: `构建于${quarter}React${quarter}`,
    link: 'StyleX',
    mid: `${quarter}与${quarter}`,
    tail: `${quarter}之上`,
    version: '19',
  },
  facts: {
    components: {
      detail: '布局、控件、数据、状态、对话与浮层。',
      label: '个组件',
    },
    templates: {
      detail: '复制进你的仓库，之后归你自己维护。',
      label: '张页面模板',
    },
    // The names are Latin and the separator is a full-width 、 that already
    // owns its em, so no quarter space is set between them.
    themes: {
      detail: (names: readonly string[]) => `${names.join('、')}，明暗各一套。`,
      label: '套皮肤',
    },
    tokens: {
      detail: (groups: number) =>
        `分${quarter}${groups}${quarter}组，运行时逐个校验。`,
      label: '个语义令牌',
    },
  },
  headline: '只做组件，不碰业务',
  // The stress falls on 那些始终归你 and stops there: the 。 that closes the
  // sentence carries no 着重号.
  lead: {
    after: '。',
    before:
      '组件、语义令牌、主题与构建工具链，装好即用。路由、接口、数据、业务逻辑一概不带——',
    emphasis: '那些始终归你',
  },
  palette: {
    body: '十个值，其中三个是同一种墨的三个层级。靛蓝只出现在焦点环、选中记号和链接上——永远是一条线，不是一块面。',
    eyebrow: '全部色值',
    heading: '纸与墨，外加一种蓝',
    // Two to three glyphs each, against “second rank” and “hover wash” in
    // English. The same ten rows therefore sit in a narrower card.
    roles: {
      accent: '靛蓝',
      ground: '页底',
      hairline: '细线',
      hover: '悬停底',
      ink: '墨',
      muted: '三墨',
      paper: '纸',
      secondary: '次墨',
      strong: '强边',
      sunken: '凹陷',
    },
  },
  preview: {
    columns: {component: '组件', description: '说明', status: '状态'},
    count: {lead: '', tail: `${quarter}个组件`},
    groups: '分组',
    layout: {cards: '卡片', label: '预览方式', table: '表格'},
    note: {
      lead: '上面这一整块都在包里：',
      tail: '。没有一处是为这张首页单画的。',
    },
    status: {planned: '计划中', ready: '就绪'},
  },
  selection: {
    body: '填色赢了眼睛，输了那一行：字被迫反白，纸面被打断，另外两行本来没有疑问，却一起降成了背景。记号只占两个像素，什么也没有拿走。',
    eyebrow: '第四条',
    heading: '选中是一个记号，不是一块底色',
    verdict: {no: '不要这样', yes: '这样'},
  },
  unreleased: `npm${quarter}上还没有发布过任何版本。首次${quarter}Changesets${quarter}发布跑通之前，请从${quarter}workspace${quarter}里直接引用这几个包。`,
};
