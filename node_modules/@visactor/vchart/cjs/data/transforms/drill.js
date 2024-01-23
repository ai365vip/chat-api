"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.drillFilter = exports.DrillEnum = void 0;

const hierarchy_1 = require("../../util/hierarchy"), vutils_1 = require("@visactor/vutils");

var DrillEnum;

!function(DrillEnum) {
    DrillEnum.DrillDown = "drillDown", DrillEnum.DrillUp = "drillUp";
}(DrillEnum = exports.DrillEnum || (exports.DrillEnum = {}));

const drillFilter = (data, op) => {
    const info = op.info(), keyField = op.keyField(), dataKey = null == info ? void 0 : info.key;
    if ((0, vutils_1.isNil)(dataKey)) return data;
    if (info.type === DrillEnum.DrillDown) {
        const targetNode = (0, hierarchy_1.findHierarchyNode)(data, dataKey, keyField, "children");
        return (0, vutils_1.array)(targetNode);
    }
    if (info.type === DrillEnum.DrillUp) {
        const targetNode = (0, hierarchy_1.findHierarchyNodeParent)(data, dataKey, keyField, "children");
        if (targetNode) return (0, vutils_1.array)(targetNode);
    }
    return data;
};

exports.drillFilter = drillFilter;
//# sourceMappingURL=drill.js.map
