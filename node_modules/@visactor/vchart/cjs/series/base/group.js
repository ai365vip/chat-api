"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Group = void 0;

const vdataset_1 = require("@visactor/vdataset"), register_1 = require("../../data/register"), dimension_data_1 = require("../../data/transforms/dimension-data");

class Group {
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
        const dataName = viewData.name, groupData = new vdataset_1.DataView(dataSet instanceof vdataset_1.DataSet ? dataSet : viewData.dataSet);
        groupData.name = dataName, groupData.parse([ viewData ], {
            type: "dataview"
        }), (0, register_1.registerDataSetInstanceTransform)(dataSet, "dimensionTree", dimension_data_1.dimensionTree), 
        groupData.transform({
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

exports.Group = Group;
//# sourceMappingURL=group.js.map
