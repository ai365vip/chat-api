"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const inversify_lite_1 = require("../../common/inversify-lite"), graphic_service_1 = require("./graphic-service"), constants_1 = require("../constants"), graphic_creator_1 = require("../graphic-creator");

exports.default = new inversify_lite_1.ContainerModule((bind => {
    bind(constants_1.GraphicService).to(graphic_service_1.DefaultGraphicService).inSingletonScope(), 
    bind(constants_1.GraphicCreator).toConstantValue(graphic_creator_1.graphicCreator);
}));
//# sourceMappingURL=graphic-module.js.map
