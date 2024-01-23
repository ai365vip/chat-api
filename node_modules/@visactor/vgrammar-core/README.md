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

VGrammar, not only generate charts, but also provide data visualization tools.

<p align="center">
  <a href="https://www.visactor.io/vgrammar">Introduction</a> •
  <a href="https://www.visactor.io/vgrammar/example">Demo</a> •
  <a href="https://www.visactor.io/vgrammar/guide/guides/quick-start">Tutorial</a> •
  <a href="https://www.visactor.io/vgrammar/api/API/View">API</a>•
  <a href="https://www.visactor.io/vgrammar/option/">Option</a>
</p>

![image test](https://github.com/visactor/vgrammar/actions/workflows/bug-server.yml/badge.svg?event=push)
![unit test](https://github.com/visactor/vgrammar/actions/workflows/unit-test.yml/badge.svg?event=push)
[![npm Version](https://img.shields.io/npm/v/@visactor/vgrammar.svg)](https://www.npmjs.com/package/@visactor/vgrammar)
[![npm Download](https://img.shields.io/npm/dm/@visactor/vgrammar.svg)](https://www.npmjs.com/package/@visactor/vgrammar)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/visactor/vgrammar/blob/main/LICENSE)

</div>

<div align="center">

English| [简体中文](./README.zh-CN.md)

</div>

<div align="center">

（video）

</div>

# Introduction

VGrammar is a visual grammar library based on visual rendering engine [VRender](https://github.com/VisActor/VRender). The core capabilities are as follows:

1. Easy to Use by Default: VGrammar features a concise syntax, comprehensive interface, rich component library, and simplified development process.
2. Rich in Capabilities: VGrammar provides extensive capabilities for chart definition, animation arrangement, artistic expression, and complete coverage of various needs.
3. Flexible and Extensible: VGrammar offers flexible extension options, including custom rendering of graphical elements, data mapping, automatic layout, and effortless expansion possibilities.

# Repo Intro

This repository includes the following packages:

1. VGrammar: The main package of VGrammar

# Usage

## Installation

[npm package](https://www.npmjs.com/package/@visactor/vgrammar)

```bash
// npm
npm install @visactor/vgrammar

// yarn
yarn add @visactor/vgrammar
```

## Quick Start

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

[More demos and detailed tutorials](https://visactor.io/vgrammar)

# Related Links

- [Official website](https://visactor.io/vgrammar)

# Ecosystem

| Project                                                     | Description                                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [VChart](https://visactor.io/vchart)                        | A charts lib based on [VisActor/VGrammar](https://visactor.io/vgrammar)                |
| [React Component Library](https://visactor.io/react-vchart) | A React chart component library based on [VisActor/VChart](https://visactor.io/vchart) |
| [AI-generated Components](https://visactor.io/ai-vchart)    | AI-generated chart component.                                                          |

# Contribution

If you would like to contribute, please read the [Code of Conduct ](./CODE_OF_CONDUCT.md) and [ Guide](./CONTRIBUTING.zh-CN.md) first。

Small streams converge to make great rivers and seas!

<a href="https://github.com/visactor/vgrammar/graphs/contributors"><img src="https://contrib.rocks/image?repo=visactor/vgrammar" /></a>

# License

[MIT License](./LICENSE)
