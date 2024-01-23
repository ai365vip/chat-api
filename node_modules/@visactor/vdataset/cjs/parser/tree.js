"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.treeParser = void 0;

const vutils_1 = require("@visactor/vutils"), d3_hierarchy_1 = require("d3-hierarchy"), constants_1 = require("../constants"), js_1 = require("../utils/js"), DEFAULT_TREE_PARSER_OPTIONS = {
    children: d => d.children,
    pureData: !1
}, treeParser = (data, options, dataView) => {
    dataView.type = constants_1.DATAVIEW_TYPE.TREE;
    const mergeOptions = (0, js_1.mergeDeepImmer)(DEFAULT_TREE_PARSER_OPTIONS, options), {children: children} = mergeOptions;
    if (children && !(0, vutils_1.isFunction)(children)) throw new TypeError("Invalid children: must be a function!");
    return (0, d3_hierarchy_1.hierarchy)(data, children);
};

exports.treeParser = treeParser;
//# sourceMappingURL=tree.js.map