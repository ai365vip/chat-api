"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BOX_PLOT_TOOLTIP_KEYS = exports.BOX_PLOT_OUTLIER_VALUE_FIELD = void 0;

const base_1 = require("./base");

var BOX_PLOT_TOOLTIP_KEYS;

exports.BOX_PLOT_OUTLIER_VALUE_FIELD = `${base_1.PREFIX}_BOX_PLOT_OUTLIER_VALUE`, 
function(BOX_PLOT_TOOLTIP_KEYS) {
    BOX_PLOT_TOOLTIP_KEYS.OUTLIER = "outlier", BOX_PLOT_TOOLTIP_KEYS.MAX = "max", BOX_PLOT_TOOLTIP_KEYS.MIN = "min", 
    BOX_PLOT_TOOLTIP_KEYS.MEDIAN = "median", BOX_PLOT_TOOLTIP_KEYS.Q1 = "q1", BOX_PLOT_TOOLTIP_KEYS.Q3 = "q3", 
    BOX_PLOT_TOOLTIP_KEYS.SERIES_FIELD = "seriesField";
}(BOX_PLOT_TOOLTIP_KEYS = exports.BOX_PLOT_TOOLTIP_KEYS || (exports.BOX_PLOT_TOOLTIP_KEYS = {}));
//# sourceMappingURL=box-plot.js.map