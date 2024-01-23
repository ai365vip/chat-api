import { lengthToRadians } from "@turf/helpers";

import { pointInRect, polygonContainPoint } from "../graphics";

import { degreeToRadian, radianToDegree } from "../angle";

function getGeom(geojson) {
    return "Feature" === geojson.type ? geojson.geometry : geojson;
}

export function isPointInPolygon(point, polygon) {
    if (!point) return !1;
    if (!polygon) return !1;
    const geom = getGeom(polygon), type = geom.type, bbox = polygon.bbox;
    let polys = geom.coordinates;
    if (bbox && !0 === pointInRect(point, {
        x1: bbox[0],
        x2: bbox[1],
        y1: bbox[1],
        y2: bbox[3]
    }, !0)) return !1;
    "Polygon" === type && (polys = [ polys ]);
    let result = !1;
    for (let i = 0; i < polys.length; ++i) for (let j = 0; j < polys[i].length; ++j) {
        if (polygonContainPoint(polys[i][j].map((p => ({
            x: p[0],
            y: p[1]
        }))), point.x, point.y)) return result = !0, result;
    }
    return result;
}

export function destination(point, distance, bearing, options = {}) {
    const longitude1 = degreeToRadian(point[0]), latitude1 = degreeToRadian(point[1]), bearingRad = degreeToRadian(bearing), radians = lengthToRadians(distance, options.units), latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(radians) + Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearingRad)), longitude2 = longitude1 + Math.atan2(Math.sin(bearingRad) * Math.sin(radians) * Math.cos(latitude1), Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2));
    return {
        x: radianToDegree(longitude2),
        y: radianToDegree(latitude2)
    };
}
//# sourceMappingURL=invariant.js.map
