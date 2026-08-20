import {quarter} from './locale.js';

/**
 * 主题页的中文文案。
 *
 * 第四套皮肤是这一页需要说话的原因。前三套用一块色样加一个十六进制值就说完
 * 了；霞没有十六进制值可说，所以那一行必须讲清楚“着色”是什么，这一页也必须
 * 把三件事分开说：着色、模糊，以及那根控制杆。
 */
export const themesZh = {
  appearance: {
    dark: '暗',
    label: '明暗',
    light: '亮',
    system: '跟随系统',
  },
  density: {compact: '紧凑', label: '密度', standard: '标准'},
  eyebrow: '令牌契约',
  glass: {
    backdrops: {
      detail:
        '每一块着色色样都从中间切开，两半分别叠在这两种背景上。背景若是一块平色，模糊后仍是它自己，所以两半都是能验算的合成值，而不是一个印象。',
      label: '两种背景',
    },
    blur: {
      label: '模糊',
      lead: '另一件事，画在另一个元素上——',
      tail: `${quarter}画在主题根的${quarter}::before${quarter}上。它作用的是宿主画在应用背后的东西；平色的背景模糊之后仍是它自己，上面那些合成值因此是能验算的，而不是一个印象。`,
    },
    label: '第四套皮肤',
    lever: {
      label: '控制杆',
      lead: '',
      tail: `${quarter}——推到${quarter}100%${quarter}就是一套普通的近白皮肤，推到${quarter}0%${quarter}只剩背景本身。`,
    },
    rule: '取值取决于背景的角色，画成一种关系；不取决于背景的角色，画成一个取值。两种画法都占同样六格，所以第四套皮肤能与另外三套并排站着，不必开特例。',
    tint: {
      label: '着色',
      lead: `底色与凹陷按控制杆给的比例留下自己的颜色；抬起的表面则夹在${quarter}`,
      tail: `${quarter}之上——正是在这里，弱化的文字压在纯黑或纯白上仍守得住${quarter}AA。`,
    },
  },
  groups: {
    count: (groups: number) => `${groups}${quarter}组`,
    label: '角色分组',
    note: '少填一个角色，就还算不上一套主题。',
    total: '合计',
  },
  lead: '一套主题，就是用一种视觉身份把令牌契约里的每个角色填满。组件从不点名任何颜色，所以换一套皮肤，下面的一切都跟着换，而不必动任何组件。',
  sample: {
    cancel: '取消',
    label: (skin: string) => `同一个页面，由${quarter}${skin}${quarter}装扮`,
    live: '实时更新',
    liveNote: '一打开就生效',
    note: '最普通的界面家具——皮肤只有对着它真要装扮的东西才有说服力。',
    owner: '负责人',
    publish: '发布',
    release: (index: number) => `第${quarter}${index}${quarter}版`,
    releaseTitle: '版本标题',
    releasesHeading: '最近的发布',
    status: '状态',
    version: '版本',
  },
  skins: {
    inUse: '正在使用',
    label: '皮肤',
    note: (skins: number, roles: number) =>
      `${skins}${quarter}套各自填满全部${quarter}${roles}${quarter}个角色；下方的样例由标记的那一套装扮。`,
    notes: {
      kasumi: '近白的着色加真实的模糊，唯一指望背后有东西的皮肤。',
      muji: '墙面偏冷，手触之处见浅木色，点一抹绿灰。',
      sumi: '高对比、近乎单色，只留一点靛蓝，不加纹理。',
      washi: '温纸与墨色，另有靛蓝、苔绿、山吹与茜红。',
    },
    roles: {
      accent: '强调',
      edge: '边线',
      ground: '底色',
      ink: '墨色',
      paper: '纸色',
      sunken: '凹陷',
    },
    solidFooter: (roles: number) =>
      `${roles}${quarter}个角色都是取值，与背后画了什么无关。`,
    tintFooter: {
      emphasis: '着色',
      lead: (tints: number) => `${tints}${quarter}个角色给的是`,
      tail: '，不是取值：两半分别叠在上面那两种背景上。',
    },
    valueChip: '是取值，不是着色',
  },
  spacingLabel: '间距',
  statuses: {open: '开放', published: '已发布', review: '复审中'},
  title: '主题',
  type: {
    label: '字号级别',
    note: '字距与字号反向——字越小，字距开得越大；每一格都用它自己那一对排出来。',
    roles: {
      body: '正文',
      eyebrow: '眉标',
      label: '标签',
      pageTitle: '页面标题',
      section: '区段',
      subsection: '小节',
    },
  },
};
