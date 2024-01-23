"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.RoughCanvasAreaRender = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), roughjs_1 = __importDefault(require("roughjs")), config_1 = require("./config");

let RoughCanvasAreaRender = class extends vrender_core_1.DefaultCanvasAreaRender {
    constructor() {
        super(...arguments), this.style = "rough";
    }
    drawSegmentItem(context, cache, fill, fillOpacity, stroke, strokeOpacity, attribute, defaultAttribute, clipRange, offsetX, offsetY, offsetZ, area, drawContext, fillCb) {
        if (fillCb) return super.drawSegmentItem(context, cache, fill, fillOpacity, stroke, strokeOpacity, attribute, defaultAttribute, clipRange, offsetX, offsetY, offsetZ, area, drawContext, fillCb);
        context.highPerformanceSave();
        const canvas = context.canvas.nativeCanvas, rc = roughjs_1.default.canvas(canvas, {}), customPath = new vrender_core_1.CustomPath2D;
        (0, vrender_core_1.drawAreaSegments)(customPath, cache, clipRange, {
            offsetX: offsetX,
            offsetY: offsetY
        });
        const {maxRandomnessOffset: maxRandomnessOffset = config_1.defaultRouthThemeSpec.maxRandomnessOffset, roughness: roughness = config_1.defaultRouthThemeSpec.roughness, bowing: bowing = config_1.defaultRouthThemeSpec.bowing, curveFitting: curveFitting = config_1.defaultRouthThemeSpec.curveFitting, curveTightness: curveTightness = config_1.defaultRouthThemeSpec.curveTightness, curveStepCount: curveStepCount = config_1.defaultRouthThemeSpec.curveStepCount, fillStyle: fillStyle = config_1.defaultRouthThemeSpec.fillStyle, fillWeight: fillWeight = config_1.defaultRouthThemeSpec.fillWeight, hachureAngle: hachureAngle = config_1.defaultRouthThemeSpec.hachureAngle, hachureGap: hachureGap = config_1.defaultRouthThemeSpec.hachureGap, simplification: simplification = config_1.defaultRouthThemeSpec.simplification, dashOffset: dashOffset = config_1.defaultRouthThemeSpec.dashOffset, dashGap: dashGap = config_1.defaultRouthThemeSpec.dashGap, zigzagOffset: zigzagOffset = config_1.defaultRouthThemeSpec.zigzagOffset, seed: seed = config_1.defaultRouthThemeSpec.seed, fillLineDash: fillLineDash = config_1.defaultRouthThemeSpec.fillLineDash, fillLineDashOffset: fillLineDashOffset = config_1.defaultRouthThemeSpec.fillLineDashOffset, disableMultiStroke: disableMultiStroke = config_1.defaultRouthThemeSpec.disableMultiStroke, disableMultiStrokeFill: disableMultiStrokeFill = config_1.defaultRouthThemeSpec.disableMultiStrokeFill, preserveVertices: preserveVertices = config_1.defaultRouthThemeSpec.preserveVertices, fixedDecimalPlaceDigits: fixedDecimalPlaceDigits = config_1.defaultRouthThemeSpec.fixedDecimalPlaceDigits} = attribute;
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

RoughCanvasAreaRender = __decorate([ (0, vrender_core_1.injectable)() ], RoughCanvasAreaRender), 
exports.RoughCanvasAreaRender = RoughCanvasAreaRender;
//# sourceMappingURL=rough-area.js.map
