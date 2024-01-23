"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.unproject = exports.project = exports.getCameraHeight = exports.getResolution = exports.distanceToZoom = exports.BASE_RESOLUTION = exports.WORLD_SIZE = exports.RELATIVE_EARTH_RADIUS = void 0;

const d3_geo_1 = require("d3-geo"), EARTH_RADIUS = 6378100;

exports.RELATIVE_EARTH_RADIUS = 63781, exports.WORLD_SIZE = exports.RELATIVE_EARTH_RADIUS * Math.PI * 2;

const fov = .25 * Math.PI, WORLD_HEIGHT = exports.WORLD_SIZE / 2 / Math.tan(fov);

exports.BASE_RESOLUTION = exports.WORLD_SIZE;

const PROJECTION_MERCATOR = (0, d3_geo_1.geoMercator)().translate([ 0, 0 ]).center([ 0, 0 ]).scale(exports.RELATIVE_EARTH_RADIUS);

function distanceToZoom(distance) {
    return -1 * Math.log2(distance / WORLD_HEIGHT);
}

function getResolution(canvasHeight, zoom) {
    return exports.WORLD_SIZE / canvasHeight / Math.pow(2, zoom);
}

function getCameraHeight(zoom) {
    return WORLD_HEIGHT / Math.pow(2, zoom);
}

function project(point) {
    const projection = PROJECTION_MERCATOR;
    if (void 0 === point[2]) {
        const result = projection(point);
        return result[1] *= -1, result;
    }
    const result = projection(point);
    return result[1] *= -1, result.push(point[2]), result;
}

function unproject(point) {
    const projection = PROJECTION_MERCATOR;
    if (void 0 === point[2]) {
        const result = projection.invert(point);
        return result[1] *= -1, result;
    }
    const result = projection.invert(point);
    return result[1], result[1] *= -1, result.push(point[2]), result;
}

exports.distanceToZoom = distanceToZoom, exports.getResolution = getResolution, 
exports.getCameraHeight = getCameraHeight, exports.project = project, exports.unproject = unproject;
//# sourceMappingURL=geo.js.map