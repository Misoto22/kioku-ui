/**
 * One template's page, in Chinese.
 *
 * The one emphasised word on the page is 编排. Chinese has no italic, so it is
 * marked with 着重号 — `Emphasis` does that; the catalogue only says which run
 * carries it, and the punctuation stays in the parts either side of it.
 */
import {quarter} from './locale.js';

export const templateDetailZh = {
  composes: {
    argument: {
      emphasis: '编排',
      lead: `清单是从模板自己的${quarter}import${quarter}里读出来的，不会和下面那份文件说两样话。这里的每一个都在包里：模板加的是`,
      tail: '，不是组件。',
    },
    figure: {
      lead: '',
      tail: () => `${quarter}个导入${quarter}·${quarter}@misoto22/kioku-ui`,
    },
    label: '组成',
    menu: (title: string) => `${title}${quarter}用到的组件`,
    unlisted: {
      label: '没有独立页面',
      tail: '子部件、钩子和类型同包导出，索引在它们所属的组件名下。',
    },
  },
  copyItIn: {
    between: `${quarter}换个落点，`,
    dest: '--dest',
    force: '--force',
    label: '抄一份进来',
    lead: `把${quarter}`,
    // Nothing follows the full stop: it already owns its em.
    middle: `${quarter}写进当前目录。`,
    tail: `${quarter}覆盖同名文件。`,
  },
  notFound: {
    action: '回到画廊',
    detail: `目录里没有这个${quarter}id。它可能被改过名，也可能这个链接是手打的。`,
    title: '没有这个模板',
  },
  otherCategories: {label: '其他分类', menu: '其他模板分类'},
  planned: '计划',
  preview: {
    label: '预览',
    note: '这不是截图：它就是下面那份源码渲染出来的，所以两者不可能对不上。它是预览而不是演示——画面里的东西不接键盘也不接指针，既不抢页面的焦点，也不抢它的滚动。',
    scale: `%${quarter}·${quarter}不可交互`,
  },
  reserved: {
    action: '回到画廊',
    lead: `${quarter}`,
    middle: `${quarter}这个${quarter}id${quarter}先占住，是为了让目录和${quarter}CLI${quarter}对同一个名字。页面还没写，现在没有东西可抄：`,
    tail: `${quarter}今天什么也找不到。画廊里列出来的，都是已经写好的。`,
    title: '已占名，尚未编写',
  },
  shape: {
    label: '形状',
    note: '页面分成哪几块，主区里放什么。这个模板没法内嵌渲染，所以由画廊卡片上的那张示意图代它出面。',
  },
  source: {
    between: `${quarter}·${quarter}`,
    label: '源码',
    lines: () => `${quarter}行`,
    note: `CLI${quarter}写出来的就是这一份，没有构建步骤，也没有藏起来的另一半。`,
  },
  status: {planned: '计划中', ready: '就绪'},
};
