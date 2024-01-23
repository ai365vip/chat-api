var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { injectable } from "../../../common/inversify-lite";

import { AREA_NUMBER_TYPE } from "../../../graphic/constants";

import { getTheme } from "../../../graphic/theme";

import { fillVisible, runFill } from "./utils";

import { DefaultCanvasAreaRender } from "./area-render";

import { drawIncrementalAreaSegments } from "../../../common/render-curve";

let DefaultIncrementalCanvasAreaRender = class extends DefaultCanvasAreaRender {
    constructor() {
        super(...arguments), this.numberType = AREA_NUMBER_TYPE;
    }
    drawShape(area, context, x, y, drawContext, params, fillCb) {
        if (area.incremental && drawContext.multiGraphicOptions) {
            const {startAtIdx: startAtIdx, length: length} = drawContext.multiGraphicOptions, {segments: segments = []} = area.attribute;
            if (startAtIdx > segments.length) return;
            const areaAttribute = getTheme(area).area, {fill: fill = areaAttribute.fill, fillOpacity: fillOpacity = areaAttribute.fillOpacity, opacity: opacity = areaAttribute.opacity, visible: visible = areaAttribute.visible} = area.attribute, fVisible = fillVisible(opacity, fillOpacity, fill), doFill = runFill(fill);
            if (!area.valid || !visible) return;
            if (!doFill) return;
            if (!fVisible && !fillCb) return;
            for (let i = startAtIdx; i < startAtIdx + length; i++) this.drawIncreaseSegment(area, context, segments[i - 1], segments[i], area.attribute.segments[i], [ areaAttribute, area.attribute ], x, y);
        } else super.drawShape(area, context, x, y, drawContext, params, fillCb);
    }
    drawIncreaseSegment(area, context, lastSeg, seg, attribute, defaultAttribute, offsetX, offsetY) {
        seg && (context.beginPath(), drawIncrementalAreaSegments(context.camera ? context : context.nativeContext, lastSeg, seg, {
            offsetX: offsetX,
            offsetY: offsetY
        }), context.setShadowBlendStyle && context.setShadowBlendStyle(area, attribute, defaultAttribute), 
        context.setCommonStyle(area, attribute, offsetX, offsetY, defaultAttribute), context.fill());
    }
};

DefaultIncrementalCanvasAreaRender = __decorate([ injectable() ], DefaultIncrementalCanvasAreaRender);

export { DefaultIncrementalCanvasAreaRender };
//# sourceMappingURL=incremental-area-render.js.map
