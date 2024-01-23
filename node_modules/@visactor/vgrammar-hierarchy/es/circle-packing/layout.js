import { eachBefore, eachAfter, calculateNodeValue } from "../utils";

import { isFunction, isNumber, isArray } from "@visactor/vutils";

import { field, zero } from "@visactor/vgrammar-util";

import { randomLCG } from "../lcg";

import { packSiblingsRandom } from "./siblings";

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
            const e = packSiblingsRandom(children, random);
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

export class CirclePackingLayout {
    constructor(options) {
        this.options = options;
        const keyOption = null == options ? void 0 : options.nodeKey, keyFunc = isFunction(keyOption) ? keyOption : keyOption ? field(keyOption) : null;
        this._getNodeKey = keyFunc, this._getPadding = isNumber(null == options ? void 0 : options.padding) ? node => options.padding : isArray(null == options ? void 0 : options.padding) ? node => {
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
        const nodes = [], res = calculateNodeValue(data, nodes, 0, -1, null, this._getNodeKey);
        this._maxDepth = res.maxDepth;
        const random = randomLCG(), root = {
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
            const sort = isFunction(nodeSort) ? this.options.nodeKey : CirclePackingLayout.defaultOpionts.nodeSort;
            eachBefore([ root ], (node => {
                node.children && node.children.length && node.children.sort(sort);
            }));
        }
        if (setRadius) eachBefore([ root ], radiusLeaf(setRadius)), eachAfter([ root ], packChildrenRandom(this._getPadding, .5, random)), 
        eachBefore([ root ], translateChild(1, this._maxDepth)); else {
            const size = Math.min(viewBox.width, viewBox.height);
            eachBefore([ root ], radiusLeaf(CirclePackingLayout.defaultOpionts.setRadius)), 
            eachAfter([ root ], packChildrenRandom(zero, 1, random)), padding && eachAfter([ root ], packChildrenRandom(this._getPadding, root.radius / size, random)), 
            eachBefore([ root ], translateChild(size / (2 * root.radius), this._maxDepth));
        }
        return includeRoot ? [ root ] : nodes;
    }
}

CirclePackingLayout.defaultOpionts = {
    setRadius: node => Math.sqrt(node.value),
    padding: 0,
    nodeSort: (a, b) => b.value - a.value
};
//# sourceMappingURL=layout.js.map