"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.mercator = void 0;

const geo_1 = require("../../utils/geo"), mercator = (data, options) => {
    const points = [];
    return data.forEach((item => {
        const [x, y] = (0, geo_1.project)([ item.lng, item.lat ]);
        points.push(Object.assign(Object.assign({}, item), {
            coordinates: [ x, y ]
        }));
    })), points;
};

exports.mercator = mercator;
//# sourceMappingURL=mercator.js.map