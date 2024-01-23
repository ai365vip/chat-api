"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.TreeLayout = void 0;

const utils_1 = require("../utils"), vutils_1 = require("@visactor/vutils"), vgrammar_util_1 = require("@visactor/vgrammar-util"), cluster_1 = require("./cluster"), tree_1 = require("./tree");

class TreeLayout {
    constructor(options) {
        this.options = Object.assign({}, TreeLayout.defaultOpionts, options);
        const keyOption = null == options ? void 0 : options.nodeKey, keyFunc = (0, vutils_1.isFunction)(keyOption) ? keyOption : keyOption ? (0, 
        vgrammar_util_1.field)(keyOption) : null;
        this._getNodeKey = keyFunc, this._maxDepth = -1;
    }
    layout(data, config) {
        const formattedData = (0, vutils_1.array)(data);
        if (!formattedData.length) return [];
        const viewBox = "width" in config ? {
            x0: 0,
            x1: config.width,
            y0: 0,
            y1: config.height,
            width: config.width,
            height: config.height
        } : {
            x0: Math.min(config.x0, config.x1),
            x1: Math.max(config.x0, config.x1),
            y0: Math.min(config.y0, config.y1),
            y1: Math.max(config.y0, config.y1),
            width: Math.abs(config.x1 - config.x0),
            height: Math.abs(config.y1 - config.y0)
        }, nodes = [], res = (0, utils_1.calculateNodeValue)(formattedData, nodes, 0, -1, null, this._getNodeKey);
        this._maxDepth = res.maxDepth;
        const isVertical = [ "vertical", "TB", "BT" ].includes(this.options.direction), vb = "radial" === this.options.layoutType ? {
            x0: 0,
            y0: 0,
            x1: 2 * Math.PI,
            y1: Math.min(viewBox.width, viewBox.height) / 2,
            width: 2 * Math.PI,
            height: Math.min(viewBox.width, viewBox.height) / 2
        } : isVertical ? viewBox : {
            x0: viewBox.y0,
            y0: viewBox.x0,
            x1: viewBox.y1,
            y1: viewBox.x1,
            width: viewBox.height,
            height: viewBox.width
        };
        if ("leaf" === this.options.alignType ? (0, cluster_1.clusterTree)(nodes[0], vb, this.options.minNodeGap, this.options.linkWidth) : (0, 
        tree_1.tidyTree)(nodes[0], vb, this.options.minNodeGap, this.options.linkWidth), 
        "radial" === this.options.layoutType) {
            const center = {
                x: (viewBox.x0 + viewBox.x1) / 2,
                y: (viewBox.y0 + viewBox.y1) / 2
            };
            (0, utils_1.eachBefore)(nodes, (node => {
                const angle = node.x, radius = node.y, res = (0, vutils_1.polarToCartesian)(center, radius, angle);
                node.x = res.x, node.y = res.y, node.maxDepth = this._maxDepth;
            }));
        } else [ "BT", "RL" ].includes(this.options.direction) ? (0, utils_1.eachBefore)(nodes, (node => {
            node.y = vb.y0 + vb.y1 - node.y, node.maxDepth = this._maxDepth;
        })) : (0, utils_1.eachBefore)(nodes, (node => {
            node.maxDepth = this._maxDepth;
        })), isVertical || (0, utils_1.eachBefore)(nodes, (node => {
            [node.x, node.y] = [ node.y, node.x ];
        }));
        return nodes;
    }
}

exports.TreeLayout = TreeLayout, TreeLayout.defaultOpionts = {
    direction: "horizontal",
    alignType: "depth",
    layoutType: "orthogonal"
};
//# sourceMappingURL=layout.js.map