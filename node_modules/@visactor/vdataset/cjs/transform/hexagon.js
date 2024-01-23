"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pointToHexbin = void 0;

const d3_hexbin_1 = require("d3-hexbin"), color_1 = require("../utils/color"), point_hex_corner = (centerPoints, size, z, angle = 0) => {
    const position = [], colors = [];
    let init_indexes = [ 0, 1, 2, 2, 3, 4, 4, 5, 0, 0, 2, 4 ];
    const last_indexes = [], offset = [];
    return centerPoints.forEach(((center, index) => {
        const offetX = center.hexCenterCoord[0] - centerPoints[0].hexCenterCoord[0], offetY = center.hexCenterCoord[1] - centerPoints[0].hexCenterCoord[1];
        offset.push(offetX, offetY, z);
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i - 30 + angle, angle_rad = Math.PI / 180 * angle_deg;
            position.push(center.hexCenterCoord[0] + size * Math.cos(angle_rad), center.hexCenterCoord[1] + size * Math.sin(angle_rad), z);
        }
        0 === index || (init_indexes = init_indexes.map((item => item + 6))), last_indexes.push(...init_indexes);
        const {color: color, opacity: opacity} = center.colorObj, arrColor = [ color.r, color.g, color.b, opacity ];
        colors.push(...arrColor);
    })), {
        position: position,
        indexes: last_indexes,
        centerPoints: [ ...centerPoints[0].hexCenterCoord, z ],
        colors: colors,
        offset: offset
    };
}, pointToHexbin = (data, options) => {
    const {size: size = 10, angle: angle = 0, calcMethod: calcMethod = "sum", padding: padding = 0, field: field = "value", colorConfig: colorConfig} = options;
    if (0 === data.length) return null;
    const {type: type, field: colorField, range: range} = colorConfig, centerPoints = (0, 
    d3_hexbin_1.hexbin)().radius(size).x((c => c.coordinates[0])).y((c => c.coordinates[1]))(data).map(((hex, index) => {
        const calcValue = hex.map((item => item[field])).reduce(((acc, curr) => acc + curr));
        return {
            _id: index,
            hexCenterCoord: [ hex.x, hex.y ],
            rawData: hex,
            count: hex.length,
            [field]: calcValue
        };
    }));
    centerPoints.sort(((a, b) => a[field] - b[field])), (0, color_1.colorLinearGenerator)(range[0], range[1], centerPoints, field);
    return point_hex_corner(centerPoints, size - padding, 0, angle);
};

exports.pointToHexbin = pointToHexbin;
//# sourceMappingURL=hexagon.js.map