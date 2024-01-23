"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.flatten = void 0;

const vgrammar_hierarchy_1 = require("@visactor/vgrammar-hierarchy"), flatten = (data, op = {}) => {
    if (!data) return [];
    const result = [];
    return (0, vgrammar_hierarchy_1.flattenNodes)(data, result, op), result;
};

exports.flatten = flatten;
//# sourceMappingURL=flatten.js.map
