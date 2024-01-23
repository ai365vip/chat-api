"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.arcModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), arc_render_1 = require("./arc-render"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), symbol_1 = require("./symbol");

let loadArcModule = !1;

exports.arcModule = new inversify_1.ContainerModule((bind => {
    loadArcModule || (loadArcModule = !0, bind(arc_render_1.DefaultCanvasArcRender).toSelf().inSingletonScope(), 
    bind(symbol_1.ArcRender).to(arc_render_1.DefaultCanvasArcRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.ArcRender), bind(constants_1.ArcRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.ArcRenderContribution));
}));
//# sourceMappingURL=arc-module.js.map
