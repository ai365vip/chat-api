"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.resetID = exports.createID = void 0;

let VChartId = 0;

const VChartIdMax = 9999999;

function createID() {
    return VChartId >= 9999999 && (VChartId = 0), VChartId++;
}

function resetID() {
    VChartId = 0;
}

exports.createID = createID, exports.resetID = resetID;
//# sourceMappingURL=id.js.map
