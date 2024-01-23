var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
};

import { injectable, application, BaseCanvas } from "@visactor/vrender-core";

import { BrowserContext2d } from "./context";

let BrowserCanvas = class extends BaseCanvas {
    constructor(params) {
        super(params);
    }
    init(params) {
        const {container: container} = params;
        if ("string" == typeof container) {
            const _c = application.global.getElementById(container);
            _c && (this._container = _c);
        } else this._container = container;
        this._context = new BrowserContext2d(this, this._dpr), this.initStyle();
    }
    initStyle() {
        if (!this.controled) return;
        const {nativeCanvas: nativeCanvas} = this;
        nativeCanvas.width = this._pixelWidth, nativeCanvas.height = this._pixelHeight;
        !nativeCanvas.style || this.setCanvasStyle(nativeCanvas, this._x, this._y, this._displayWidth, this._displayHeight), 
        this._container && this._container.appendChild(nativeCanvas), this.visiable || this.hide();
    }
    hide() {
        this._nativeCanvas && (this._nativeCanvas.style.display = "none");
    }
    show() {
        this._nativeCanvas && (this._nativeCanvas.style.display = "block");
    }
    applyPosition() {
        const canvas = this._nativeCanvas;
        canvas.style.position = "absolute", canvas.style.top = `${this._y}px`, canvas.style.left = `${this._x}px`;
    }
    resetStyle(params) {
        if (!this.controled) return;
        const {width: width = this._displayWidth, height: height = this._displayHeight, dpr: dpr = this._dpr, x: x = this._x, y: y = this._y} = params, {nativeCanvas: nativeCanvas} = this;
        nativeCanvas.width = width * dpr, nativeCanvas.height = height * dpr;
        !nativeCanvas.style || this.setCanvasStyle(nativeCanvas, x, y, width, height), params.id && (nativeCanvas.id = params.id), 
        this.visiable || this.hide();
    }
    setCanvasStyle(canvas, x, y, w, h) {
        this.controled && (canvas.style.width = `${w}px`, canvas.style.height = `${h}px`);
    }
    toDataURL(mimeType, quality) {
        return "image/jpeg" === mimeType ? this._nativeCanvas.toDataURL(mimeType, quality) : "image/png" === mimeType ? this._nativeCanvas.toDataURL(mimeType) : this._nativeCanvas.toDataURL(mimeType, quality);
    }
    resize(width, height) {
        if (!this.controled) return;
        this._pixelWidth = width * this._dpr, this._pixelHeight = height * this._dpr, this._displayWidth = width, 
        this._displayHeight = height, this._nativeCanvas.style && (this._nativeCanvas.style.width = `${width}px`, 
        this._nativeCanvas.style.height = `${height}px`), this._nativeCanvas.width = this._pixelWidth, 
        this._nativeCanvas.height = this._pixelHeight;
        this._context.dpr = this._dpr;
    }
};

BrowserCanvas.env = "browser", BrowserCanvas = __decorate([ injectable(), __metadata("design:paramtypes", [ Object ]) ], BrowserCanvas);

export { BrowserCanvas };
//# sourceMappingURL=canvas.js.map
