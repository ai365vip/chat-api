var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { injectable } from "../../../common/inversify-lite";

import { getTheme } from "../../../graphic/theme";

import { GLYPH_NUMBER_TYPE } from "../../../graphic/constants";

let DefaultCanvasGlyphRender = class {
    constructor() {
        this.numberType = GLYPH_NUMBER_TYPE;
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
        const glyphTheme = getTheme(glyph), subGraphic = glyph.getSubGraphic();
        subGraphic.length && subGraphic.forEach((g => {
            drawContext.drawContribution.renderItem(g, drawContext, {
                theme: glyphTheme
            });
        })), context.highPerformanceRestore();
    }
};

DefaultCanvasGlyphRender = __decorate([ injectable() ], DefaultCanvasGlyphRender);

export { DefaultCanvasGlyphRender };
//# sourceMappingURL=glyph-render.js.map
