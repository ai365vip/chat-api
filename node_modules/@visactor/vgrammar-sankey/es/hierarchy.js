import { isNil } from "@visactor/vutils";

export const calculateNodeValue = subTree => {
    let sum = 0;
    return subTree.forEach(((node, index) => {
        var _a;
        isNil(node.value) && ((null === (_a = node.children) || void 0 === _a ? void 0 : _a.length) ? node.value = calculateNodeValue(node.children) : node.value = 0), 
        sum += Math.abs(node.value);
    })), sum;
};
//# sourceMappingURL=hierarchy.js.map