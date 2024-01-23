"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pathModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), path_render_1 = require("./path-render"), symbol_1 = require("./symbol");

let loadPathModule = !1;

exports.pathModule = new inversify_1.ContainerModule((bind => {
    loadPathModule || (loadPathModule = !0, bind(path_render_1.DefaultCanvasPathRender).toSelf().inSingletonScope(), 
    bind(symbol_1.PathRender).to(path_render_1.DefaultCanvasPathRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.PathRender), bind(constants_1.PathRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.PathRenderContribution));
}));
//# sourceMappingURL=path-module.js.map
