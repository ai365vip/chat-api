"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultIncrementalCanvasAreaRender = void 0;

const inversify_lite_1 = require("../../../common/inversify-lite"), constants_1 = require("../../../graphic/constants"), theme_1 = require("../../../graphic/theme"), utils_1 = require("./utils"), area_render_1 = require("./area-render"), render_curve_1 = require("../../../common/render-curve");

let DefaultIncrementalCanvasAreaRender = class extends area_render_1.DefaultCanvasAreaRender {
    constructor() {
        super(...arguments), this.numberType = constants_1.AREA_NUMBER_TYPE;
    }
    drawShape(area, context, x, y, drawContext, params, fillCb) {
        if (area.incremental && drawContext.multiGraphicOptions) {
            const {startAtIdx: startAtIdx, length: length} = drawContext.multiGraphicOptions, {segments: segments = []} = area.attribute;
            if (startAtIdx > segments.length) return;
            const areaAttribute = (0, theme_1.getTheme)(area).area, {fill: fill = areaAttribute.fill, fillOpacity: fillOpacity = areaAttribute.fillOpacity, opacity: opacity = areaAttribute.opacity, visible: visible = areaAttribute.visible} = area.attribute, fVisible = (0, 
            utils_1.fillVisible)(opacity, fillOpacity, fill), doFill = (0, utils_1.runFill)(fill);
            if (!area.valid || !visible) return;
            if (!doFill) return;
            if (!fVisible && !fillCb) return;
            for (let i = startAtIdx; i < startAtIdx + length; i++) this.drawIncreaseSegment(area, context, segments[i - 1], segments[i], area.attribute.segments[i], [ areaAttribute, area.attribute ], x, y);
        } else super.drawShape(area, context, x, y, drawContext, params, fillCb);
    }
    drawIncreaseSegment(area, context, lastSeg, seg, attribute, defaultAttribute, offsetX, offsetY) {
        seg && (context.beginPath(), (0, render_curve_1.drawIncrementalAreaSegments)(context.camera ? context : context.nativeContext, lastSeg, seg, {
            offsetX: offsetX,
            offsetY: offsetY
        }), context.setShadowBlendStyle && context.setShadowBlendStyle(area, attribute, defaultAttribute), 
        context.setCommonStyle(area, attribute, offsetX, offsetY, defaultAttribute), context.fill());
    }
};

DefaultIncrementalCanvasAreaRender = __decorate([ (0, inversify_lite_1.injectable)() ], DefaultIncrementalCanvasAreaRender), 
exports.DefaultIncrementalCanvasAreaRender = DefaultIncrementalCanvasAreaRender;
//# sourceMappingURL=incremental-area-render.js.map
