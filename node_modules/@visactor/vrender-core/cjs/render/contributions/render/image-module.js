"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.imageModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), image_render_1 = require("./image-render"), symbol_1 = require("./symbol");

let loadImageModule = !1;

exports.imageModule = new inversify_1.ContainerModule((bind => {
    loadImageModule || (loadImageModule = !0, bind(symbol_1.ImageRender).to(image_render_1.DefaultCanvasImageRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.ImageRender), bind(constants_1.ImageRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.ImageRenderContribution));
}));
//# sourceMappingURL=image-module.js.map
