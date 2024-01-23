"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.defaultAreaBackgroundRenderContribution = exports.defaultAreaTextureRenderContribution = void 0;

const base_contribution_render_1 = require("./base-contribution-render"), area_texture_contribution_render_1 = require("./area-texture-contribution-render");

exports.defaultAreaTextureRenderContribution = new area_texture_contribution_render_1.DefaultAreaTextureRenderContribution, 
exports.defaultAreaBackgroundRenderContribution = base_contribution_render_1.defaultBaseBackgroundRenderContribution;
//# sourceMappingURL=area-contribution-render.js.map
