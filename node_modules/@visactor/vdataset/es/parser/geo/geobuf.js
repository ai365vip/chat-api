import * as geobuf from "geobuf";

import Pbf from "pbf";

import { DATAVIEW_TYPE } from "../../constants";

import { mergeDeepImmer } from "../../utils/js";

import { DEFAULT_GEOJSON_OPTIONS, geoJSONParser } from "./geojson";

const DEFAULT_GEOBUF_OPTIONS = {};

export const geoBufParser = (data, options = {}, dataView) => {
    dataView.type = DATAVIEW_TYPE.GEO;
    const mergeOptions = mergeDeepImmer(DEFAULT_GEOJSON_OPTIONS, DEFAULT_GEOBUF_OPTIONS, options), geoData = geobuf.decode(new Pbf(data));
    return geoJSONParser(geoData, mergeOptions, dataView);
};
//# sourceMappingURL=geobuf.js.map