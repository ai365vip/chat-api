"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.textModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), symbol_1 = require("./symbol"), text_render_1 = require("./text-render");

let loadTextModule = !1;

exports.textModule = new inversify_1.ContainerModule((bind => {
    loadTextModule || (loadTextModule = !0, bind(symbol_1.TextRender).to(text_render_1.DefaultCanvasTextRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.TextRender), bind(constants_1.TextRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.TextRenderContribution));
}));
//# sourceMappingURL=text-module.js.map
