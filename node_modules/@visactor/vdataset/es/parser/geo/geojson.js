import { geoPath } from "d3-geo";

import { DATAVIEW_TYPE } from "../../constants";

import { mergeDeepImmer } from "../../utils/js";

import trufRewind from "@turf/rewind";

import flatten from "@turf/flatten";

import { isObject } from "@visactor/vutils";

const geoPathInstance = geoPath();

export const DEFAULT_GEOJSON_OPTIONS = {
    centroid: !1,
    name: !1,
    bbox: !1,
    rewind: !1
};

export const MultiToSingle = feature => {
    if (feature.geometry.type.startsWith("Multi")) {
        const f = flatten(feature).features[0];
        return Object.assign(Object.assign({}, f), f.properties);
    }
    return Object.assign(Object.assign({}, feature), feature.properties);
};

export const flattenFeature = data => {
    const featuresArr = [];
    return data.forEach((item => {
        "FeatureCollection" === item.type ? item.features.forEach((feature => {
            featuresArr.push(MultiToSingle(feature));
        })) : featuresArr.push(MultiToSingle(item));
    })), featuresArr;
};

export const geoJSONParser = (data, options = {}, dataView) => {
    dataView.type = DATAVIEW_TYPE.GEO;
    const mergeOptions = mergeDeepImmer(DEFAULT_GEOJSON_OPTIONS, options), {centroid: centroid, name: name, bbox: bbox, rewind: rewind} = mergeOptions;
    if (Array.isArray(data)) return flattenFeature(data);
    let features = data.features;
    return rewind && (features = trufRewind(data, {
        reverse: !isObject(rewind) || rewind.reverse
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
//# sourceMappingURL=geojson.js.map