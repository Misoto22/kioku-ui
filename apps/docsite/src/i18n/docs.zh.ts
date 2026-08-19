import {quarter} from './locale.js';

/**
 * 上手指南的中文文案。
 *
 * 不是英文的译文：同一件事，中文有中文的说法。每一步都按同一个顺序回答三个
 * 问题——它为什么存在，跳过会怎样，以及凭什么判断它已经生效。
 */
export const docsZh = {
  eyebrow: '上手指南',
  exit: {
    components: '浏览组件',
    templates: '浏览模板',
    terminal: {
      lead: '也可以走终端：',
      tail: `${quarter}会把文件写进当前目录。`,
    },
  },
  factLabels: {skip: '跳过会怎样', worked: '生效的标志'},
  lead: '从空白应用到装扮完成，中间只有四步：每一步为什么存在，以及凭什么判断它已经生效。',
  notice: {
    detail: `npm${quarter}上还没有任何版本。首个版本发布之前，请通过${quarter}workspace${quarter}引用这两个包。`,
    label: '尚未发布',
  },
  rail: {
    done: {
      fonts: '字体族',
      imports: `css${quarter}导入`,
      label: '做完之后手上有',
      packages: '依赖包',
      providers: '提供者',
      roles: '已填的令牌角色',
    },
    labour: {
      detail: '库只提供组件、令牌与主题。路由、数据与文案仍归你的应用所有。',
      label: '分工',
    },
    never: {
      items: [
        '不做路由、请求或持久化。',
        '不为产品、领域概念或页面命名。',
        '不附带字体文件，也不替你定文案。',
        '不写死主题，也不记住你选了哪个。',
      ],
      label: '这个库不做的事',
    },
    stepsLabel: '四个步骤',
  },
  steps: {
    fonts: {
      caption: '文档头部',
      note: {
        detail: 'Shippori Mincho、Zen Kaku Gothic New、IBM Plex Mono。',
        label: '点名的三族',
      },
      skip: '不报错。明朝体的声音只是不再出现。',
      summary: `主题只写下字体族名，不附带字体文件——那是宿主的决定。这三族正是${quarter}kioku${quarter}包点名要的；缺了它们，一切都退回系统界面字体。`,
      title: '载入字体',
      worked: '眉标排成明朝体，一列数字在字位上对齐。',
    },
    install: {
      caption: '终端',
      skip: (roles: number) => `只装组件，${roles}${quarter}个角色全部落空。`,
      summary:
        '两个包：组件本体，加一套主题包。所有令牌的取值都由主题包给出，所以只装组件的构建会呈现为未上色的样子。',
      title: '安装',
      worked: `node_modules${quarter}里两个名字都在，theme.css${quarter}可被解析。`,
    },
    page: {
      caption: '三类模板',
      summary: `从模板开始，而不是从空文件开始。CLI${quarter}把源码复制进你的仓库，从此归你所有，要改不必等下一次发版。`,
      title: '搭一个页面',
      worked: `复制过来的页面，直接用第${quarter}02${quarter}步定下的主题构建。`,
    },
    provider: {
      caption: '应用根部',
      note: {
        detail: `先${quarter}reset，再${quarter}styles，主题最后落笔。`,
        label: '三行导入有先后',
      },
      skip: `没有${quarter}data-theme${quarter}根，每个令牌都落空。`,
      summary: `提供者把选中主题的令牌写在一个元素上，它下面的每个组件都从那里读取。主题清单与默认${quarter}id${quarter}由宿主给出；库自己不做存储，也不写死任何主题。`,
      title: '包裹应用',
      worked: `包裹元素上带着${quarter}data-theme="washi"${quarter}与${quarter}data-density。`,
    },
  },
  title: '开始使用',
  wrapNote: {
    lead: `这里开着${quarter}`,
    tail: `，因为${quarter}href${quarter}那一行长过任何一栏。续行往里缩一格，就不会被误读成下一行源码。`,
  },
};
