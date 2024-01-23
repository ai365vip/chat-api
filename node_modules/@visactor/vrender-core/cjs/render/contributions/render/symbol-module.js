"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.symbolModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), symbol_1 = require("./symbol"), symbol_render_1 = require("./symbol-render");

let loadSymbolModule = !1;

exports.symbolModule = new inversify_1.ContainerModule((bind => {
    loadSymbolModule || (loadSymbolModule = !0, bind(symbol_render_1.DefaultCanvasSymbolRender).toSelf().inSingletonScope(), 
    bind(symbol_1.SymbolRender).to(symbol_render_1.DefaultCanvasSymbolRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.SymbolRender), bind(constants_1.SymbolRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.SymbolRenderContribution));
}));
//# sourceMappingURL=symbol-module.js.map
