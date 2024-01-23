var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { injectable } from "../../../common/inversify-lite";

import { getTheme } from "../../../graphic/theme";

import { LINE_NUMBER_TYPE } from "../../../graphic/constants";

import { fillVisible, runFill, runStroke, strokeVisible } from "./utils";

import { DefaultCanvasLineRender } from "./line-render";

import { drawIncrementalSegments } from "../../../common/render-curve";

let DefaultIncrementalCanvasLineRender = class extends DefaultCanvasLineRender {
    constructor() {
        super(...arguments), this.numberType = LINE_NUMBER_TYPE;
    }
    drawShape(line, context, x, y, drawContext, params, fillCb, strokeCb) {
        if (line.incremental && drawContext.multiGraphicOptions) {
            const {startAtIdx: startAtIdx, length: length} = drawContext.multiGraphicOptions, {segments: segments = []} = line.attribute;
            if (startAtIdx > segments.length) return;
            const lineAttribute = getTheme(line).line, {fill: fill = lineAttribute.fill, stroke: stroke = lineAttribute.stroke, opacity: opacity = lineAttribute.opacity, fillOpacity: fillOpacity = lineAttribute.fillOpacity, strokeOpacity: strokeOpacity = lineAttribute.strokeOpacity, lineWidth: lineWidth = lineAttribute.lineWidth, visible: visible = lineAttribute.visible} = line.attribute, fVisible = fillVisible(opacity, fillOpacity, fill), sVisible = strokeVisible(opacity, strokeOpacity), doFill = runFill(fill), doStroke = runStroke(stroke, lineWidth);
            if (!line.valid || !visible) return;
            if (!doFill && !doStroke) return;
            if (!(fVisible || sVisible || fillCb || strokeCb)) return;
            const {context: context} = drawContext;
            for (let i = startAtIdx; i < startAtIdx + length; i++) this.drawIncreaseSegment(line, context, segments[i - 1], segments[i], line.attribute.segments[i], [ lineAttribute, line.attribute ], x, y);
        } else super.drawShape(line, context, x, y, drawContext, params, fillCb, strokeCb);
    }
    drawIncreaseSegment(line, context, lastSeg, seg, attribute, defaultAttribute, offsetX, offsetY) {
        seg && (context.beginPath(), drawIncrementalSegments(context.nativeContext, lastSeg, seg, {
            offsetX: offsetX,
            offsetY: offsetY
        }), context.setShadowBlendStyle && context.setShadowBlendStyle(line, attribute, defaultAttribute), 
        context.setStrokeStyle(line, attribute, offsetX, offsetY, defaultAttribute), context.stroke());
    }
};

DefaultIncrementalCanvasLineRender = __decorate([ injectable() ], DefaultIncrementalCanvasLineRender);

export { DefaultIncrementalCanvasLineRender };
//# sourceMappingURL=incremental-line-render.js.map
