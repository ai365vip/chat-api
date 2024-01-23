"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.rect3dModule = void 0;

const inversify_1 = require("../../../common/inversify"), rect3d_render_1 = require("./rect3d-render"), symbol_1 = require("./symbol");

let loadRect3dModule = !1;

exports.rect3dModule = new inversify_1.ContainerModule((bind => {
    loadRect3dModule || (loadRect3dModule = !0, bind(symbol_1.Rect3DRender).to(rect3d_render_1.DefaultCanvasRect3dRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.Rect3DRender));
}));
//# sourceMappingURL=rect3d-module.js.map
