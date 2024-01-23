"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.GeoTreeParser = void 0;

const vutils_1 = require("@visactor/vutils"), constants_1 = require("../../constants"), GeoTreeParser = (data, options = {}, dataView) => (dataView.type = constants_1.DATAVIEW_TYPE.GEO, 
(0, vutils_1.cloneDeep)(data));

exports.GeoTreeParser = GeoTreeParser;
//# sourceMappingURL=geotree.js.map