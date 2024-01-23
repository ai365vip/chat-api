"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.lineModule = void 0;

const inversify_1 = require("../../../common/inversify"), incremental_line_render_1 = require("./incremental-line-render"), line_render_1 = require("./line-render"), symbol_1 = require("./symbol");

let loadLineModule = !1;

exports.lineModule = new inversify_1.ContainerModule((bind => {
    loadLineModule || (loadLineModule = !0, bind(line_render_1.DefaultCanvasLineRender).toSelf().inSingletonScope(), 
    bind(incremental_line_render_1.DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope(), 
    bind(symbol_1.LineRender).to(line_render_1.DefaultCanvasLineRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.LineRender));
}));
//# sourceMappingURL=line-module.js.map
