import { GrammarMarkType } from "./enums";

export const traverseMarkTree = (rootMark, childrenKey, apply, filter, leafFirst) => {
    const traverse = mark => {
        if (leafFirst || !mark || filter && !filter(mark) || apply.call(null, mark), mark.markType === GrammarMarkType.group) {
            const children = mark[childrenKey];
            children && children.forEach((child => {
                traverse(child);
            }));
        }
        leafFirst && (!mark || filter && !filter(mark) || apply.call(null, mark));
    };
    traverse(rootMark);
};
//# sourceMappingURL=mark-tree.js.map