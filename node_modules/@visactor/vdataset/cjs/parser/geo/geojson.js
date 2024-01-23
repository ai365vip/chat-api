"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.geoJSONParser = exports.flattenFeature = exports.MultiToSingle = exports.DEFAULT_GEOJSON_OPTIONS = void 0;

const d3_geo_1 = require("d3-geo"), constants_1 = require("../../constants"), js_1 = require("../../utils/js"), rewind_1 = __importDefault(require("@turf/rewind")), flatten_1 = __importDefault(require("@turf/flatten")), vutils_1 = require("@visactor/vutils"), geoPathInstance = (0, 
d3_geo_1.geoPath)();

exports.DEFAULT_GEOJSON_OPTIONS = {
    centroid: !1,
    name: !1,
    bbox: !1,
    rewind: !1
};

const MultiToSingle = feature => {
    if (feature.geometry.type.startsWith("Multi")) {
        const f = (0, flatten_1.default)(feature).features[0];
        return Object.assign(Object.assign({}, f), f.properties);
    }
    return Object.assign(Object.assign({}, feature), feature.properties);
};

exports.MultiToSingle = MultiToSingle;

const flattenFeature = data => {
    const featuresArr = [];
    return data.forEach((item => {
        "FeatureCollection" === item.type ? item.features.forEach((feature => {
            featuresArr.push((0, exports.MultiToSingle)(feature));
        })) : featuresArr.push((0, exports.MultiToSingle)(item));
    })), featuresArr;
};

exports.flattenFeature = flattenFeature;

const geoJSONParser = (data, options = {}, dataView) => {
    dataView.type = constants_1.DATAVIEW_TYPE.GEO;
    const mergeOptions = (0, js_1.mergeDeepImmer)(exports.DEFAULT_GEOJSON_OPTIONS, options), {centroid: centroid, name: name, bbox: bbox, rewind: rewind} = mergeOptions;
    if (Array.isArray(data)) return (0, exports.flattenFeature)(data);
    let features = data.features;
    return rewind && (features = (0, rewind_1.default)(data, {
        reverse: !(0, vutils_1.isObject)(rewind) || rewind.reverse
    }).features), features.forEach((feature => {
        if (centroid) {
            const centroid = geoPathInstance.centroid(feature);
            feature.centroidX = centroid[0], feature.centroidY = centroid[1];
        }
        if (name && (feature.name = feature.properties.name), bbox) {
            const bbox = geoPathInstance.bounds(feature);
            feature.bbox = bbox;
        }
    })), data.features = features, data;
};

exports.geoJSONParser = geoJSONParser;
//# sourceMappingURL=geojson.js.map