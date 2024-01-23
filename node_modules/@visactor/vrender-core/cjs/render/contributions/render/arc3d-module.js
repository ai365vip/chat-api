"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.arc3dModule = void 0;

const inversify_1 = require("../../../common/inversify"), arc3d_render_1 = require("./arc3d-render"), symbol_1 = require("./symbol");

let loadArc3dModule = !1;

exports.arc3dModule = new inversify_1.ContainerModule((bind => {
    loadArc3dModule || (loadArc3dModule = !0, bind(symbol_1.Arc3dRender).to(arc3d_render_1.DefaultCanvasArc3DRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.Arc3dRender));
}));
//# sourceMappingURL=arc3d-module.js.map
