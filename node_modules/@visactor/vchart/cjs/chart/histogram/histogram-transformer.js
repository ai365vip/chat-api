"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.HistogramChartSpecTransformer = void 0;

const util_1 = require("../util"), base_1 = require("./base");

class HistogramChartSpecTransformer extends base_1.BaseHistogramChartSpecTransformer {
    transformSpec(spec) {
        super.transformSpec(spec), (0, util_1.setDefaultCrosshairForCartesianChart)(spec);
    }
}

exports.HistogramChartSpecTransformer = HistogramChartSpecTransformer;
//# sourceMappingURL=histogram-transformer.js.map
