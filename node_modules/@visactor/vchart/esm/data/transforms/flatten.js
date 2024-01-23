import { flattenNodes } from "@visactor/vgrammar-hierarchy";

export const flatten = (data, op = {}) => {
    if (!data) return [];
    const result = [];
    return flattenNodes(data, result, op), result;
};
//# sourceMappingURL=flatten.js.map
