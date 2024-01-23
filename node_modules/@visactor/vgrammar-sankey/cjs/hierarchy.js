"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.calculateNodeValue = void 0;

const vutils_1 = require("@visactor/vutils"), calculateNodeValue = subTree => {
    let sum = 0;
    return subTree.forEach(((node, index) => {
        var _a;
        (0, vutils_1.isNil)(node.value) && ((null === (_a = node.children) || void 0 === _a ? void 0 : _a.length) ? node.value = (0, 
        exports.calculateNodeValue)(node.children) : node.value = 0), sum += Math.abs(node.value);
    })), sum;
};

exports.calculateNodeValue = calculateNodeValue;
//# sourceMappingURL=hierarchy.js.map