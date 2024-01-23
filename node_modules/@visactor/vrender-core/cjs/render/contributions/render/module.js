"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const inversify_lite_1 = require("../../../common/inversify-lite"), contribution_provider_1 = require("../../../common/contribution-provider"), draw_contribution_1 = require("./draw-contribution"), group_render_1 = require("./group-render"), incremental_draw_contribution_1 = require("./incremental-draw-contribution"), symbol_1 = require("./symbol"), draw_interceptor_1 = require("./draw-interceptor"), constants_1 = require("./contributions/constants"), contributions_1 = require("./contributions");

exports.default = new inversify_lite_1.ContainerModule((bind => {
    bind(contributions_1.DefaultBaseBackgroundRenderContribution).toSelf().inSingletonScope(), 
    bind(contributions_1.DefaultBaseTextureRenderContribution).toSelf().inSingletonScope(), 
    bind(symbol_1.DrawContribution).to(draw_contribution_1.DefaultDrawContribution), 
    bind(symbol_1.IncrementalDrawContribution).to(incremental_draw_contribution_1.DefaultIncrementalDrawContribution), 
    bind(symbol_1.GroupRender).to(group_render_1.DefaultCanvasGroupRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.GroupRender), (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.GroupRenderContribution), 
    bind(contributions_1.DefaultBaseInteractiveRenderContribution).toSelf().inSingletonScope(), 
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.InteractiveSubRenderContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, symbol_1.GraphicRender), 
    bind(draw_interceptor_1.CommonDrawItemInterceptorContribution).toSelf().inSingletonScope(), 
    bind(draw_interceptor_1.DrawItemInterceptor).toService(draw_interceptor_1.CommonDrawItemInterceptorContribution), 
    (0, contribution_provider_1.bindContributionProvider)(bind, draw_interceptor_1.DrawItemInterceptor);
}));
//# sourceMappingURL=module.js.map
