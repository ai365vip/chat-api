"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.topoJSONParser = void 0;

const topojson_client_1 = require("topojson-client"), vutils_1 = require("@visactor/vutils"), constants_1 = require("../../constants"), js_1 = require("../../utils/js"), geojson_1 = require("./geojson"), DEFAULT_TOPOJSON_OPTIONS = {}, topoJSONParser = (data, options, dataView) => {
    dataView.type = constants_1.DATAVIEW_TYPE.GEO;
    const mergeOptions = (0, js_1.mergeDeepImmer)(geojson_1.DEFAULT_GEOJSON_OPTIONS, DEFAULT_TOPOJSON_OPTIONS, options), {object: object} = mergeOptions;
    if (!(0, vutils_1.isString)(object)) throw new TypeError("Invalid object: must be a string!");
    const geoData = (0, topojson_client_1.feature)(data, data.objects[object]);
    return (0, geojson_1.geoJSONParser)(geoData, mergeOptions, dataView);
};

exports.topoJSONParser = topoJSONParser;
//# sourceMappingURL=topojson.js.map