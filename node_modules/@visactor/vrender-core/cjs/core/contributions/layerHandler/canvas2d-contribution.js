"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CanvasLayerHandlerContribution = void 0;

const inversify_lite_1 = require("../../../common/inversify-lite"), util_1 = require("../../../canvas/util"), application_1 = require("../../../application");

let CanvasLayerHandlerContribution = class {
    constructor() {
        this.type = "static", this.offscreen = !1, this.global = application_1.application.global;
    }
    setDpr(dpr) {
        this.canvas.dpr = dpr;
    }
    init(layer, window, params) {
        if (this.layer = layer, this.window = window, params.main) this.main = !0, this.context = window.getContext(), 
        this.canvas = this.context.getCanvas(); else {
            let nativeCanvas;
            this.main = !1, params.canvasId && (nativeCanvas = this.global.getElementById(params.canvasId)), 
            nativeCanvas || (nativeCanvas = this.global.createCanvas({
                width: window.width,
                height: window.height
            })), nativeCanvas.style && (nativeCanvas.style["pointer-events"] = "none");
            const windowCanvas = window.getContext().getCanvas().nativeCanvas, canvas = (0, 
            util_1.wrapCanvas)({
                nativeCanvas: nativeCanvas,
                width: window.width,
                height: window.height,
                dpr: window.dpr,
                id: params.canvasId,
                canvasControled: !0,
                container: window.getContainer(),
                x: windowCanvas.offsetLeft,
                y: windowCanvas.offsetTop
            });
            canvas.applyPosition(), this.canvas = canvas, this.context = canvas.getContext();
        }
    }
    resize(w, h) {
        this.canvas.resize(w, h);
    }
    resizeView(w, h) {}
    render(group, params, userParams) {
        var _a;
        if (!this.main) {
            const windowCanvas = this.window.getContext().getCanvas().nativeCanvas;
            !windowCanvas || this.canvas.x === windowCanvas.offsetLeft && this.canvas.y === windowCanvas.offsetTop || (this.canvas.x = windowCanvas.offsetLeft, 
            this.canvas.y = windowCanvas.offsetTop, this.canvas.applyPosition());
        }
        params.renderService.render(group, Object.assign(Object.assign({
            context: this.context,
            clear: null !== (_a = params.background) && void 0 !== _a ? _a : "#ffffff"
        }, params), userParams));
    }
    merge(layerHandlers) {
        layerHandlers.forEach((l => {
            const canvas = l.getContext().canvas.nativeCanvas;
            this.context.drawImage(canvas, 0, 0);
        }));
    }
    prepare(dirtyBounds, params) {}
    drawTo(target, group, params) {
        var _a;
        const context = target.getContext();
        params.renderService.render(group, Object.assign(Object.assign({
            context: context
        }, params), {
            clear: params.clear ? null !== (_a = params.background) && void 0 !== _a ? _a : "#fff" : void 0
        }));
    }
    getContext() {
        return this.context;
    }
    release() {
        this.canvas.release();
    }
};

CanvasLayerHandlerContribution = __decorate([ (0, inversify_lite_1.injectable)(), __metadata("design:paramtypes", []) ], CanvasLayerHandlerContribution), 
exports.CanvasLayerHandlerContribution = CanvasLayerHandlerContribution;
//# sourceMappingURL=canvas2d-contribution.js.map
