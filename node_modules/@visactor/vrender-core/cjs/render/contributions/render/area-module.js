"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.areaModule = void 0;

const contribution_provider_1 = require("../../../common/contribution-provider"), inversify_1 = require("../../../common/inversify"), area_render_1 = require("./area-render"), contributions_1 = require("./contributions"), constants_1 = require("./contributions/constants"), incremental_area_render_1 = require("./incremental-area-render"), symbol_1 = require("./symbol");

let loadAreaModule = !1;

exports.areaModule = new inversify_1.ContainerModule((bind => {
    loadAreaModule || (loadAreaModule = !0, bind(area_render_1.DefaultCanvasAreaRender).toSelf().inSingletonScope(), 
    bind(symbol_1.AreaRender).to(area_render_1.DefaultCanvasAreaRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.AreaRender), bind(constants_1.AreaRenderContribution).toService(contributions_1.DefaultBaseInteractiveRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.AreaRenderContribution), 
    bind(incremental_area_render_1.DefaultIncrementalCanvasAreaRender).toSelf().inSingletonScope());
}));
//# sourceMappingURL=area-module.js.map
