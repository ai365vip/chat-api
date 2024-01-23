<div align="center">
  <a href="https://github.com/VisActor#gh-light-mode-only" target="_blank">
    <img alt="VisActor Logo" width="200" src="https://github.com/VisActor/.github/blob/main/profile/logo_500_200_light.svg"/>
  </a>
  <a href="https://github.com/VisActor#gh-dark-mode-only" target="_blank">
    <img alt="VisActor Logo" width="200" src="https://github.com/VisActor/.github/blob/main/profile/logo_500_200_dark.svg"/>
  </a>
</div>

<div align="center">
  <h1>VGrammar</h1>
</div>

<div align="center">

VGrammar，不只是生成万千图表的可视化语法，更是化枯燥为神奇的数据魔法师。

<p align="center">
  <a href="https://www.visactor.io/vgrammar">简介</a> •
  <a href="https://www.visactor.io/vgrammar/example">Demo</a> •
  <a href="https://www.visactor.io/vgrammar/guide/guides/quick-start">教程</a> •
  <a href="https://www.visactor.io/vgrammar/api/API/View">API</a>•
  <a href="https://www.visactor.io/vgrammar/option/">配置</a>
</p>

![image test](https://github.com/visactor/vgrammar/actions/workflows/bug-server.yml/badge.svg?event=push)
![unit test](https://github.com/visactor/vgrammar/actions/workflows/unit-test.yml/badge.svg?event=push)
[![npm Version](https://img.shields.io/npm/v/@visactor/vgrammar.svg)](https://www.npmjs.com/package/@visactor/vgrammar)
[![npm Download](https://img.shields.io/npm/dm/@visactor/vgrammar.svg)](https://www.npmjs.com/package/@visactor/vgrammar)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/visactor/vgrammar/blob/main/LICENSE)

</div>

<div align="center">

[English](./README.md) | 简体中文

</div>

<div align="center">

（演示视频）

</div>

# 简介

VGrammar 是 VisActor 可视化体系中的可视化语法库，基于可视化渲染引擎 [VRender](https://github.com/VisActor/VRender) 进行组件封装。核心能力如下：

1. 默认好用：语法简洁，接口完备，组件丰富，开发简单；
2. 能力丰富：图表定义，动画编排，艺术表达，完整覆盖；
3. 灵活扩展：图元渲染，数据映射，自动布局，轻松扩展；

# 仓库简介

本仓库包含如下 package

1. VGrammar: 图形语法

# 使用

## 安装

[npm package](https://www.npmjs.com/package/@visactor/vgrammar)

```bash
// npm
npm install @visactor/vgrammar

// yarn
yarn add @visactor/vgrammar
```

## 快速上手

```javascript
import { View } from '@visactor/vgrammar';

const spec = {
  data: [
    {
      id: 'table',
      values: [
        {
          value: 3676,
          name: ' ~ 29'
        },
        {
          value: 3872,
          name: '30 ~ 39'
        },
        {
          value: 1668,
          name: '40 ~ 49'
        },
        {
          value: 610,
          name: '50 ~'
        }
      ]
    },
    {
      id: 'pie',
      source: 'table',
      transform: [
        {
          type: 'pie',
          field: 'value',
          asStartAngle: 'startAngle',
          asEndAngle: 'endAngle'
        }
      ]
    }
  ],

  scales: [
    {
      id: 'colorScale',
      type: 'ordinal',
      domain: { data: 'table', field: 'name' },
      range: [
        '#6690F2',
        '#70D6A3',
        '#B4E6E2',
        '#63B5FC',
        '#FF8F62',
        '#FFDC83',
        '#BCC5FD',
        '#A29BFE',
        '#63C4C7',
        '#F68484'
      ]
    }
  ],

  marks: [
    {
      type: 'arc',
      from: { data: 'pie' },
      dependency: ['viewBox', 'colorScale'],
      encode: {
        update: (datum, element, params) => {
          const viewBox = params.viewBox;
          const maxR = Math.min(viewBox.width() / 2, viewBox.height() / 2);
          return {
            x: viewBox.x1 + viewBox.width() / 2,
            y: viewBox.y1 + viewBox.height() / 2,
            startAngle: datum.startAngle,
            endAngle: datum.endAngle,
            innerRadius: 100,
            outerRadius: maxR,
            fill: params.colorScale.scale(datum.name)
          };
        },
        hover: {
          fill: 'red'
        }
      }
    }
  ]
};

const vGrammarView = new View({
  autoFit: true,
  container: 'chart',
  hover: true
});
vGrammarView.parseSpec(spec);

vGrammarView.runAsync();
```

##

[更多 demo 和详细教程](https://visactor.io/vgrammar)

# 相关链接

- [官网](https://visactor.io/vgrammar)

# 生态

| 项目 | 介绍 |
| ---- | ---- |

| [VChart](https://visactor.io/vchart) | 基于 [VisActor/VGrammar](https://visactor.io/vgrammar) 封装的图表库。 |
| [React 组件库](https://visactor.io/react-vgrammar) | 基于 [VisActor/VChart](https://visactor.io/vgrammar) 的 React 图表 组件库。 |
| [智能生成组件](https://visactor.io/ai-vgrammar) | 基于 AI 的智能图表生成组件 |

# 参与贡献

如想参与贡献，请先阅读 [行为准则](./CODE_OF_CONDUCT.md) 和 [贡献指南](./CONTRIBUTING.zh-CN.md)。

细流成河，终成大海！

<a href="https://github.com/visactor/vgrammar/graphs/contributors"><img src="https://contrib.rocks/image?repo=visactor/vgrammar" /></a>

# 许可证

[MIT 协议](./LICENSE)
