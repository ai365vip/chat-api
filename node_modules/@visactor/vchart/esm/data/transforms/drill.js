import { findHierarchyNode, findHierarchyNodeParent } from "../../util/hierarchy";

import { array, isNil } from "@visactor/vutils";

export var DrillEnum;

!function(DrillEnum) {
    DrillEnum.DrillDown = "drillDown", DrillEnum.DrillUp = "drillUp";
}(DrillEnum || (DrillEnum = {}));

export const drillFilter = (data, op) => {
    const info = op.info(), keyField = op.keyField(), dataKey = null == info ? void 0 : info.key;
    if (isNil(dataKey)) return data;
    if (info.type === DrillEnum.DrillDown) {
        const targetNode = findHierarchyNode(data, dataKey, keyField, "children");
        return array(targetNode);
    }
    if (info.type === DrillEnum.DrillUp) {
        const targetNode = findHierarchyNodeParent(data, dataKey, keyField, "children");
        if (targetNode) return array(targetNode);
    }
    return data;
};
//# sourceMappingURL=drill.js.map
