"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.polygonModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), polygon_render_1 = require("./polygon-render"), symbol_1 = require("./symbol");

let loadPolygonModule = !1;

exports.polygonModule = new inversify_1.ContainerModule((bind => {
    loadPolygonModule || (loadPolygonModule = !0, bind(symbol_1.PolygonRender).to(polygon_render_1.DefaultCanvasPolygonRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.PolygonRender), bind(constants_1.PolygonRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.PolygonRenderContribution));
}));
//# sourceMappingURL=polygon-module.js.map
