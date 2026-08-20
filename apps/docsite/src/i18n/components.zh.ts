/**
 * The component library index, in Chinese.
 *
 * The group names and every label are Chinese; the component names are not
 * translated, because they are the identifiers a reader will type. A Latin run
 * or a numeral inside a Chinese line is parted from the glyphs either side of
 * it by a quarter em, and nothing follows full-width punctuation — it already
 * owns its em.
 */
import {quarter} from './locale.js';

export const componentsZh = {
  accessibility: {
    audit: (skins: number) =>
      `每一则故事都用${quarter}axe${quarter}跑过：${skins}${quarter}套皮肤、两种明暗全覆盖，结果按指纹比对已提交的基线。`,
    label: '可访问性',
  },
  empty: {
    clearSearch: '清空搜索',
    detailInGroup:
      '这一组里没有对得上的。换个短一点的词，或者把索引放宽到全部分组。',
    detailOverall: '换个短一点的词，或者清空搜索看全部。',
    showEveryGroup: '显示全部分组',
    title: '没有匹配的组件',
  },
  everything: '全部',
  groupMenu: (group: string) => `${group}组件`,
  groups: {
    Action: '动作',
    Chat: '对话',
    Container: '容器',
    Content: '内容',
    'Data input': '数据录入',
    'Feedback & status': '反馈与状态',
    Layout: '布局',
    Navigation: '导航',
    Overlay: '浮层',
    'Table & list': '表格与列表',
    Utility: '工具',
  },
  groupsLabel: '组件分组',
  inLibrary: {
    label: '库中总数',
    note: `个组件，没有占位的，也没有只写了名字的。每一个都带自己的文档、测试和一则${quarter}Storybook${quarter}故事。`,
  },
  intro:
    '分组是按照找东西的习惯排的，不是按照源码目录排的。组名和它们的顺序沿用本库所对齐的那套参考体系，因此在两边之间来回时，同一个组件总在同一个位置。',
  matches: (count: number, query: string) =>
    `“${query}”${quarter}匹配到${quarter}${count}${quarter}个组件`,
  openStorybook: `打开${quarter}Storybook`,
  search: '搜索组件',
  shown: {
    lead: `已显示${quarter}`,
    ofTotal: ' / ',
    // Nothing follows a full-width comma: it already owns its em.
    thenGroups: `，共${quarter}`,
    tail: () => `${quarter}组`,
  },
  startHere: '从这里开始',
  title: '浏览组件库',
};
