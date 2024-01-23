import { isFunction } from "@visactor/vutils";

import { hierarchy } from "d3-hierarchy";

import { DATAVIEW_TYPE } from "../constants";

import { mergeDeepImmer } from "../utils/js";

const DEFAULT_TREE_PARSER_OPTIONS = {
    children: d => d.children,
    pureData: !1
};

export const treeParser = (data, options, dataView) => {
    dataView.type = DATAVIEW_TYPE.TREE;
    const mergeOptions = mergeDeepImmer(DEFAULT_TREE_PARSER_OPTIONS, options), {children: children} = mergeOptions;
    if (children && !isFunction(children)) throw new TypeError("Invalid children: must be a function!");
    return hierarchy(data, children);
};
//# sourceMappingURL=tree.js.map