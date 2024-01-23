"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultCanvasGlyphRender = void 0;

const inversify_lite_1 = require("../../../common/inversify-lite"), theme_1 = require("../../../graphic/theme"), constants_1 = require("../../../graphic/constants");

let DefaultCanvasGlyphRender = class {
    constructor() {
        this.numberType = constants_1.GLYPH_NUMBER_TYPE;
    }
    drawShape(glyph, context, x, y, drawContext, params, fillCb, strokeCb) {
        drawContext.drawContribution && glyph.getSubGraphic().forEach((item => {
            const renderer = drawContext.drawContribution.getRenderContribution(item);
            renderer && renderer.drawShape && renderer.drawShape(item, context, x, y, drawContext, params, fillCb, strokeCb);
        }));
    }
    draw(glyph, renderService, drawContext, params) {
        const {context: context} = drawContext;
        if (!context) return;
        if (context.highPerformanceSave(), !drawContext.drawContribution) return;
        const glyphTheme = (0, theme_1.getTheme)(glyph), subGraphic = glyph.getSubGraphic();
        subGraphic.length && subGraphic.forEach((g => {
            drawContext.drawContribution.renderItem(g, drawContext, {
                theme: glyphTheme
            });
        })), context.highPerformanceRestore();
    }
};

DefaultCanvasGlyphRender = __decorate([ (0, inversify_lite_1.injectable)() ], DefaultCanvasGlyphRender), 
exports.DefaultCanvasGlyphRender = DefaultCanvasGlyphRender;
//# sourceMappingURL=glyph-render.js.map
