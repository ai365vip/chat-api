"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.traverseMarkTree = void 0;

const enums_1 = require("./enums"), traverseMarkTree = (rootMark, childrenKey, apply, filter, leafFirst) => {
    const traverse = mark => {
        if (leafFirst || !mark || filter && !filter(mark) || apply.call(null, mark), mark.markType === enums_1.GrammarMarkType.group) {
            const children = mark[childrenKey];
            children && children.forEach((child => {
                traverse(child);
            }));
        }
        leafFirst && (!mark || filter && !filter(mark) || apply.call(null, mark));
    };
    traverse(rootMark);
};

exports.traverseMarkTree = traverseMarkTree;
//# sourceMappingURL=mark-tree.js.map