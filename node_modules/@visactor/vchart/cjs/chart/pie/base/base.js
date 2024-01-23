"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BasePieChart = void 0;

const base_1 = require("../../base"), pie_transformer_1 = require("./pie-transformer");

class BasePieChart extends base_1.BaseChart {
    constructor() {
        super(...arguments), this.transformerConstructor = pie_transformer_1.BasePieChartSpecTransformer;
    }
}

exports.BasePieChart = BasePieChart, BasePieChart.transformerConstructor = pie_transformer_1.BasePieChartSpecTransformer;
//# sourceMappingURL=base.js.map
