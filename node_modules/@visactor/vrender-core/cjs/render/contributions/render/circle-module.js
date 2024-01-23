"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.circleModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), circle_render_1 = require("./circle-render"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), symbol_1 = require("./symbol");

let loadCircleModule = !1;

exports.circleModule = new inversify_1.ContainerModule((bind => {
    loadCircleModule || (loadCircleModule = !0, bind(circle_render_1.DefaultCanvasCircleRender).toSelf().inSingletonScope(), 
    bind(symbol_1.CircleRender).to(circle_render_1.DefaultCanvasCircleRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.CircleRender), bind(constants_1.CircleRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.CircleRenderContribution));
}));
//# sourceMappingURL=circle-module.js.map
