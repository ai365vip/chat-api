import { geoMercator } from "d3-geo";

const EARTH_RADIUS = 6378100;

export const RELATIVE_EARTH_RADIUS = 63781;

export const WORLD_SIZE = 63781 * Math.PI * 2;

const fov = .25 * Math.PI, WORLD_HEIGHT = WORLD_SIZE / 2 / Math.tan(fov);

export const BASE_RESOLUTION = WORLD_SIZE;

const PROJECTION_MERCATOR = geoMercator().translate([ 0, 0 ]).center([ 0, 0 ]).scale(63781);

export function distanceToZoom(distance) {
    return -1 * Math.log2(distance / WORLD_HEIGHT);
}

export function getResolution(canvasHeight, zoom) {
    return WORLD_SIZE / canvasHeight / Math.pow(2, zoom);
}

export function getCameraHeight(zoom) {
    return WORLD_HEIGHT / Math.pow(2, zoom);
}

export function project(point) {
    const projection = PROJECTION_MERCATOR;
    if (void 0 === point[2]) {
        const result = projection(point);
        return result[1] *= -1, result;
    }
    const result = projection(point);
    return result[1] *= -1, result.push(point[2]), result;
}

export function unproject(point) {
    const projection = PROJECTION_MERCATOR;
    if (void 0 === point[2]) {
        const result = projection.invert(point);
        return result[1] *= -1, result;
    }
    const result = projection.invert(point);
    return result[1], result[1] *= -1, result.push(point[2]), result;
}
//# sourceMappingURL=geo.js.map