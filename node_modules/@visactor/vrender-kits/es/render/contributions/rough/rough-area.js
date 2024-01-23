var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { drawAreaSegments, DefaultCanvasAreaRender, CustomPath2D, injectable } from "@visactor/vrender-core";

import rough from "roughjs";

import { defaultRouthThemeSpec } from "./config";

let RoughCanvasAreaRender = class extends DefaultCanvasAreaRender {
    constructor() {
        super(...arguments), this.style = "rough";
    }
    drawSegmentItem(context, cache, fill, fillOpacity, stroke, strokeOpacity, attribute, defaultAttribute, clipRange, offsetX, offsetY, offsetZ, area, drawContext, fillCb) {
        if (fillCb) return super.drawSegmentItem(context, cache, fill, fillOpacity, stroke, strokeOpacity, attribute, defaultAttribute, clipRange, offsetX, offsetY, offsetZ, area, drawContext, fillCb);
        context.highPerformanceSave();
        const canvas = context.canvas.nativeCanvas, rc = rough.canvas(canvas, {}), customPath = new CustomPath2D;
        drawAreaSegments(customPath, cache, clipRange, {
            offsetX: offsetX,
            offsetY: offsetY
        });
        const {maxRandomnessOffset: maxRandomnessOffset = defaultRouthThemeSpec.maxRandomnessOffset, roughness: roughness = defaultRouthThemeSpec.roughness, bowing: bowing = defaultRouthThemeSpec.bowing, curveFitting: curveFitting = defaultRouthThemeSpec.curveFitting, curveTightness: curveTightness = defaultRouthThemeSpec.curveTightness, curveStepCount: curveStepCount = defaultRouthThemeSpec.curveStepCount, fillStyle: fillStyle = defaultRouthThemeSpec.fillStyle, fillWeight: fillWeight = defaultRouthThemeSpec.fillWeight, hachureAngle: hachureAngle = defaultRouthThemeSpec.hachureAngle, hachureGap: hachureGap = defaultRouthThemeSpec.hachureGap, simplification: simplification = defaultRouthThemeSpec.simplification, dashOffset: dashOffset = defaultRouthThemeSpec.dashOffset, dashGap: dashGap = defaultRouthThemeSpec.dashGap, zigzagOffset: zigzagOffset = defaultRouthThemeSpec.zigzagOffset, seed: seed = defaultRouthThemeSpec.seed, fillLineDash: fillLineDash = defaultRouthThemeSpec.fillLineDash, fillLineDashOffset: fillLineDashOffset = defaultRouthThemeSpec.fillLineDashOffset, disableMultiStroke: disableMultiStroke = defaultRouthThemeSpec.disableMultiStroke, disableMultiStrokeFill: disableMultiStrokeFill = defaultRouthThemeSpec.disableMultiStrokeFill, preserveVertices: preserveVertices = defaultRouthThemeSpec.preserveVertices, fixedDecimalPlaceDigits: fixedDecimalPlaceDigits = defaultRouthThemeSpec.fixedDecimalPlaceDigits} = attribute;
        let {fill: fillColor, stroke: strokeColor, lineWidth: lineWidth} = attribute;
        return Array.isArray(defaultAttribute) ? defaultAttribute.forEach((item => {
            fillColor = null != fillColor ? fillColor : item.fill, strokeColor = null != strokeColor ? strokeColor : item.stroke, 
            lineWidth = null != lineWidth ? lineWidth : item.lineWidth;
        })) : (fillColor = null != fillColor ? fillColor : defaultAttribute.fill, strokeColor = null != strokeColor ? strokeColor : defaultAttribute.stroke, 
        lineWidth = null != lineWidth ? lineWidth : defaultAttribute.lineWidth), rc.path(customPath.toString(), {
            fill: fill ? fillColor : void 0,
            strokeWidth: lineWidth,
            maxRandomnessOffset: maxRandomnessOffset,
            roughness: roughness,
            bowing: bowing,
            curveFitting: curveFitting,
            curveTightness: curveTightness,
            curveStepCount: curveStepCount,
            fillStyle: fillStyle,
            fillWeight: fillWeight,
            hachureAngle: hachureAngle,
            hachureGap: hachureGap,
            simplification: simplification,
            dashOffset: dashOffset,
            dashGap: dashGap,
            zigzagOffset: zigzagOffset,
            seed: seed,
            fillLineDash: fillLineDash,
            fillLineDashOffset: fillLineDashOffset,
            disableMultiStroke: disableMultiStroke,
            disableMultiStrokeFill: disableMultiStrokeFill,
            preserveVertices: preserveVertices,
            fixedDecimalPlaceDigits: fixedDecimalPlaceDigits
        }), context.highPerformanceRestore(), !1;
    }
};

RoughCanvasAreaRender = __decorate([ injectable() ], RoughCanvasAreaRender);

export { RoughCanvasAreaRender };
//# sourceMappingURL=rough-area.js.map
