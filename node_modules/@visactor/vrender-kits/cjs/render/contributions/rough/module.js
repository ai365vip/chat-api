"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const vrender_core_1 = require("@visactor/vrender-core"), rough_arc_1 = require("./rough-arc"), rough_area_1 = require("./rough-area"), rough_circle_1 = require("./rough-circle"), rough_line_1 = require("./rough-line"), rough_path_1 = require("./rough-path"), rough_rect_1 = require("./rough-rect"), rough_symbol_1 = require("./rough-symbol");

exports.default = new vrender_core_1.ContainerModule((bind => {
    bind(rough_circle_1.RoughCanvasCircleRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_circle_1.RoughCanvasCircleRender), 
    bind(rough_rect_1.RoughCanvasRectRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_rect_1.RoughCanvasRectRender), 
    bind(rough_path_1.RoughCanvasPathRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_path_1.RoughCanvasPathRender), 
    bind(rough_symbol_1.RoughCanvasSymbolRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_symbol_1.RoughCanvasSymbolRender), 
    bind(rough_line_1.RoughCanvasLineRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_line_1.RoughCanvasLineRender), 
    bind(rough_area_1.RoughCanvasAreaRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_area_1.RoughCanvasAreaRender), 
    bind(rough_arc_1.RoughCanvasArcRender).toSelf().inSingletonScope(), bind(vrender_core_1.GraphicRender).to(rough_arc_1.RoughCanvasArcRender);
}));
//# sourceMappingURL=module.js.map
