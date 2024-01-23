"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.rectModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), rect_render_1 = require("./rect-render"), symbol_1 = require("./symbol");

let loadRectModule = !1;

exports.rectModule = new inversify_1.ContainerModule((bind => {
    loadRectModule || (loadRectModule = !0, bind(rect_render_1.DefaultCanvasRectRender).toSelf().inSingletonScope(), 
    bind(symbol_1.RectRender).to(rect_render_1.DefaultCanvasRectRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.RectRender), bind(contributions_1.SplitRectAfterRenderContribution).toSelf(), 
    bind(contributions_1.SplitRectBeforeRenderContribution).toSelf(), bind(constants_1.RectRenderContribution).toService(contributions_1.SplitRectAfterRenderContribution), 
    bind(constants_1.RectRenderContribution).toService(contributions_1.SplitRectBeforeRenderContribution), 
    bind(constants_1.RectRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.RectRenderContribution));
}));
//# sourceMappingURL=rect-module.js.map
