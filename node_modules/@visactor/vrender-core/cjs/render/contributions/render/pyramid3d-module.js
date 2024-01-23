"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pyramid3dModule = void 0;

const inversify_1 = require("../../../common/inversify"), pyramid3d_render_1 = require("./pyramid3d-render"), symbol_1 = require("./symbol");

let loadPyramid3dModule = !1;

exports.pyramid3dModule = new inversify_1.ContainerModule((bind => {
    loadPyramid3dModule || (loadPyramid3dModule = !0, bind(symbol_1.Pyramid3dRender).to(pyramid3d_render_1.DefaultCanvasPyramid3dRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.Pyramid3dRender));
}));
//# sourceMappingURL=pyramid3d-module.js.map
