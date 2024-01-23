"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerChartPlugin = void 0;

const factory_1 = require("../../core/factory"), registerChartPlugin = plugin => {
    factory_1.Factory.registerChartPlugin(plugin.type, plugin);
};

exports.registerChartPlugin = registerChartPlugin;
//# sourceMappingURL=register.js.map
