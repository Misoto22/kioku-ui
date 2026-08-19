/**
 * One component's page, in Chinese.
 *
 * The component's own name is never translated: it is the identifier a reader
 * will type. Where a name or a figure meets a Chinese glyph a quarter em parts
 * them, and a sentence that ends in a `<Code>` run the page supplies takes its
 * full stop in the trailing part rather than inside the code.
 */
import {quarter} from './locale.js';

export const componentDetailZh = {
  breadcrumbRoot: '组件',
  example: {
    label: '示例',
    none: '文档里没有写示例。',
    note: '跑得起来的最短写法。上表没写必填的，都能省掉。',
  },
  inherited: {
    label: '继承',
    tail: '样式归包自己管，调用方伸不进来。',
  },
  noSidecar: {
    lead: (name: string) =>
      `${name}${quarter}没有向本站提供文档随件，所以这里列不出它的属性。类型本身就是契约：导入进来读${quarter}`,
    tail: '。',
  },
  noSpecimen: {
    detail: (name: string, skins: number) =>
      `${name}${quarter}还没有登记实例。它的故事画出了它的每一种状态，${skins}${quarter}款皮肤、两种明暗，全部过${quarter}axe${quarter}审计。`,
    title: '未登记实例',
  },
  noTypeColumn: {
    label: '没有类型列',
    lead: `文档随件只记名字、是否必填和说明三样。类型和默认值不在这里编第二遍——类型本身就是${quarter}`,
    tail: '，抄一份到这个页面上来，只会抄出一份迟早过期的。',
  },
  notFound: {
    action: '回到组件库',
    detail: '目录里没有叫这个名字的。它可能被改过名，也可能这个链接是手打的。',
    title: '没有这个组件',
  },
  openStory: '打开故事',
  otherGroups: {label: '其他分组', menu: '其他组件分组'},
  props: {
    description: '说明',
    figure: {
      between: `${quarter}项自有${quarter}·${quarter}`,
      lead: '',
      tail: () => `${quarter}组继承`,
    },
    label: '属性',
    name: '名称',
    optional: '可选',
    required: '必填',
    requiredColumn: '必填',
  },
  specimen: {label: '实例', themeLabel: '实例皮肤'},
  status: {planned: '计划中', ready: '就绪'},
  stories: {
    label: '故事',
    none: (name: string) => `${name}${quarter}还没有登记故事。`,
    note: (skins: number) =>
      `故事画出它的每一种状态，${skins}${quarter}款皮肤、两种明暗，全部过${quarter}axe${quarter}审计。`,
    open: '打开',
  },
  viewSource: '查看源码',
};
