"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CirclePackingLayout = void 0;

const utils_1 = require("../utils"), vutils_1 = require("@visactor/vutils"), vgrammar_util_1 = require("@visactor/vgrammar-util"), lcg_1 = require("../lcg"), siblings_1 = require("./siblings");

function radiusLeaf(radius) {
    return function(node) {
        node.children || (node.radius = Math.max(0, +radius(node) || 0));
    };
}

function packChildrenRandom(padding, k, random) {
    return function(node) {
        const children = null == node ? void 0 : node.children;
        if (children) {
            let i;
            const n = children.length, r = padding(node) * k || 0;
            if (r) for (i = 0; i < n; ++i) children[i].radius += r;
            const e = (0, siblings_1.packSiblingsRandom)(children, random);
            if (r) for (i = 0; i < n; ++i) children[i].radius -= r;
            node.radius = e + r;
        }
    };
}

function translateChild(k, maxDepth) {
    return function(node, index, parent) {
        node.radius *= k, node.maxDepth = maxDepth, parent && (node.x = parent.x + k * node.x, 
        node.y = parent.y + k * node.y);
    };
}

class CirclePackingLayout {
    constructor(options) {
        this.options = options;
        const keyOption = null == options ? void 0 : options.nodeKey, keyFunc = (0, vutils_1.isFunction)(keyOption) ? keyOption : keyOption ? (0, 
        vgrammar_util_1.field)(keyOption) : null;
        this._getNodeKey = keyFunc, this._getPadding = (0, vutils_1.isNumber)(null == options ? void 0 : options.padding) ? node => options.padding : (0, 
        vutils_1.isArray)(null == options ? void 0 : options.padding) ? node => {
            var _a;
            return null !== (_a = options.padding[node.depth + 1]) && void 0 !== _a ? _a : 0;
        } : () => 0, this._maxDepth = -1;
    }
    layout(data, config) {
        var _a;
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
        };
        if (!data || !data.length) return [];
        const nodes = [], res = (0, utils_1.calculateNodeValue)(data, nodes, 0, -1, null, this._getNodeKey);
        this._maxDepth = res.maxDepth;
        const random = (0, lcg_1.randomLCG)(), root = {
            flattenIndex: -1,
            maxDepth: -1,
            key: "root",
            depth: -1,
            index: -1,
            value: res.sum,
            datum: null,
            children: nodes,
            x: viewBox.x0 + viewBox.width / 2,
            y: viewBox.y0 + viewBox.height / 2
        }, {nodeSort: nodeSort, setRadius: setRadius, padding: padding, includeRoot: includeRoot} = null !== (_a = this.options) && void 0 !== _a ? _a : {};
        if (!1 !== nodeSort) {
            const sort = (0, vutils_1.isFunction)(nodeSort) ? this.options.nodeKey : CirclePackingLayout.defaultOpionts.nodeSort;
            (0, utils_1.eachBefore)([ root ], (node => {
                node.children && node.children.length && node.children.sort(sort);
            }));
        }
        if (setRadius) (0, utils_1.eachBefore)([ root ], radiusLeaf(setRadius)), (0, utils_1.eachAfter)([ root ], packChildrenRandom(this._getPadding, .5, random)), 
        (0, utils_1.eachBefore)([ root ], translateChild(1, this._maxDepth)); else {
            const size = Math.min(viewBox.width, viewBox.height);
            (0, utils_1.eachBefore)([ root ], radiusLeaf(CirclePackingLayout.defaultOpionts.setRadius)), 
            (0, utils_1.eachAfter)([ root ], packChildrenRandom(vgrammar_util_1.zero, 1, random)), 
            padding && (0, utils_1.eachAfter)([ root ], packChildrenRandom(this._getPadding, root.radius / size, random)), 
            (0, utils_1.eachBefore)([ root ], translateChild(size / (2 * root.radius), this._maxDepth));
        }
        return includeRoot ? [ root ] : nodes;
    }
}

exports.CirclePackingLayout = CirclePackingLayout, CirclePackingLayout.defaultOpionts = {
    setRadius: node => Math.sqrt(node.value),
    padding: 0,
    nodeSort: (a, b) => b.value - a.value
};
//# sourceMappingURL=layout.js.map