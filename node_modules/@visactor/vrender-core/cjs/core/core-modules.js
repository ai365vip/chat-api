"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const inversify_lite_1 = require("../common/inversify-lite"), global_1 = require("./global"), graphic_utils_1 = require("./graphic-utils"), layer_service_1 = require("./layer-service"), window_1 = require("./window"), constants_1 = require("./constants"), constants_2 = require("../constants");

exports.default = new inversify_lite_1.ContainerModule((bind => {
    bind(constants_2.VGlobal).to(global_1.DefaultGlobal).inSingletonScope(), bind(window_1.VWindow).to(window_1.DefaultWindow), 
    bind(constants_1.GraphicUtil).to(graphic_utils_1.DefaultGraphicUtil).inSingletonScope(), 
    bind(constants_1.TransformUtil).to(graphic_utils_1.DefaultTransformUtil).inSingletonScope(), 
    bind(constants_1.LayerService).to(layer_service_1.DefaultLayerService).inSingletonScope();
}));
//# sourceMappingURL=core-modules.js.map
