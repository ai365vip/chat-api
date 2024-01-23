import { feature } from "topojson-client";

import { isString } from "@visactor/vutils";

import { DATAVIEW_TYPE } from "../../constants";

import { mergeDeepImmer } from "../../utils/js";

import { DEFAULT_GEOJSON_OPTIONS, geoJSONParser } from "./geojson";

const DEFAULT_TOPOJSON_OPTIONS = {};

export const topoJSONParser = (data, options, dataView) => {
    dataView.type = DATAVIEW_TYPE.GEO;
    const mergeOptions = mergeDeepImmer(DEFAULT_GEOJSON_OPTIONS, DEFAULT_TOPOJSON_OPTIONS, options), {object: object} = mergeOptions;
    if (!isString(object)) throw new TypeError("Invalid object: must be a string!");
    const geoData = feature(data, data.objects[object]);
    return geoJSONParser(geoData, mergeOptions, dataView);
};
//# sourceMappingURL=topojson.js.map