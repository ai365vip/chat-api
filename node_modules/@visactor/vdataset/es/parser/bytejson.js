var __rest = this && this.__rest || function(s, e) {
    var t = {};
    for (var p in s) Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0 && (t[p] = s[p]);
    if (null != s && "function" == typeof Object.getOwnPropertySymbols) {
        var i = 0;
        for (p = Object.getOwnPropertySymbols(s); i < p.length; i++) e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]) && (t[p[i]] = s[p[i]]);
    }
    return t;
};

import { DATAVIEW_TYPE } from "../constants";

export const byteJSONParser = (data, options, dataView) => {
    dataView.type = DATAVIEW_TYPE.BYTE;
    const result = [], {layerType: layerType} = options;
    return data.forEach((item => {
        let lType = layerType, coord = [];
        if (item.from && (lType = "FlyLine", coord = [ item.from, item.to ]), item.lng && (lType = "Point", 
        coord = [ item.lng, item.lat ]), item.coordinates) {
            const suffix = "Line" === lType ? "LineString" : "Polygon";
            lType = Array.isArray(item.coordinates[0][0]) ? `Multi${suffix}` : suffix, coord = item.coordinates;
        }
        const {coordinates: coordinates} = item, others = __rest(item, [ "coordinates" ]), dataItem = Object.assign(Object.assign({}, others), {
            geometry: {
                type: lType,
                coordinates: coord
            }
        });
        result.push(dataItem);
    })), result;
};
//# sourceMappingURL=bytejson.js.map