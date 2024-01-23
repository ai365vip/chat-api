"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getDirectionFromSeriesSpec = void 0;

const interface_1 = require("../interface");

function getDirectionFromSeriesSpec(spec) {
    var _a, _b;
    const {type: type} = spec;
    return type === interface_1.SeriesTypeEnum.sankey ? null !== (_a = spec.direction) && void 0 !== _a ? _a : "horizontal" : null !== (_b = spec.direction) && void 0 !== _b ? _b : "vertical";
}

exports.getDirectionFromSeriesSpec = getDirectionFromSeriesSpec;
//# sourceMappingURL=spec.js.map
