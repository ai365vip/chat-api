"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.destination = exports.isPointInPolygon = void 0;

const helpers_1 = require("@turf/helpers"), graphics_1 = require("../graphics"), angle_1 = require("../angle");

function getGeom(geojson) {
    return "Feature" === geojson.type ? geojson.geometry : geojson;
}

function isPointInPolygon(point, polygon) {
    if (!point) return !1;
    if (!polygon) return !1;
    const geom = getGeom(polygon), type = geom.type, bbox = polygon.bbox;
    let polys = geom.coordinates;
    if (bbox && !0 === (0, graphics_1.pointInRect)(point, {
        x1: bbox[0],
        x2: bbox[1],
        y1: bbox[1],
        y2: bbox[3]
    }, !0)) return !1;
    "Polygon" === type && (polys = [ polys ]);
    let result = !1;
    for (let i = 0; i < polys.length; ++i) for (let j = 0; j < polys[i].length; ++j) {
        if ((0, graphics_1.polygonContainPoint)(polys[i][j].map((p => ({
            x: p[0],
            y: p[1]
        }))), point.x, point.y)) return result = !0, result;
    }
    return result;
}

function destination(point, distance, bearing, options = {}) {
    const longitude1 = (0, angle_1.degreeToRadian)(point[0]), latitude1 = (0, angle_1.degreeToRadian)(point[1]), bearingRad = (0, 
    angle_1.degreeToRadian)(bearing), radians = (0, helpers_1.lengthToRadians)(distance, options.units), latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(radians) + Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearingRad)), longitude2 = longitude1 + Math.atan2(Math.sin(bearingRad) * Math.sin(radians) * Math.cos(latitude1), Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2));
    return {
        x: (0, angle_1.radianToDegree)(longitude2),
        y: (0, angle_1.radianToDegree)(latitude2)
    };
}

exports.isPointInPolygon = isPointInPolygon, exports.destination = destination;
//# sourceMappingURL=invariant.js.map
