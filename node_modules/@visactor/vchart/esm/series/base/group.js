import { DataSet, DataView } from "@visactor/vdataset";

import { registerDataSetInstanceTransform } from "../../data/register";

import { dimensionTree } from "../../data/transforms/dimension-data";

export class Group {
    get fields() {
        return this._fields;
    }
    get groupData() {
        return this._groupData;
    }
    constructor(fields) {
        this._fields = [], this._fields = fields;
    }
    initData(viewData, dataSet) {
        const dataName = viewData.name, groupData = new DataView(dataSet instanceof DataSet ? dataSet : viewData.dataSet);
        groupData.name = dataName, groupData.parse([ viewData ], {
            type: "dataview"
        }), registerDataSetInstanceTransform(dataSet, "dimensionTree", dimensionTree), groupData.transform({
            type: "dimensionTree",
            options: {
                fields: this._fields
            }
        }, !1), groupData.target.addListener("change", this.groupDataUpdate.bind(this)), 
        this._groupData = groupData;
    }
    groupDataUpdate() {}
    getGroupValueInField(field) {
        var _a, _b, _c;
        const values = null === (_c = null === (_b = null === (_a = this.groupData) || void 0 === _a ? void 0 : _a.latestData) || void 0 === _b ? void 0 : _b.dimensionValues) || void 0 === _c ? void 0 : _c[field];
        return values ? Array.from(values) : [];
    }
}
//# sourceMappingURL=group.js.map
