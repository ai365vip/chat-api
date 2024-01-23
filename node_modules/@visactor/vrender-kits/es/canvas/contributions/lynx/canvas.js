var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
};

import { injectable, BaseCanvas } from "@visactor/vrender-core";

import { LynxContext2d } from "./context";

let LynxCanvas = class extends BaseCanvas {
    constructor(params) {
        super(params);
    }
    init() {
        this._context = new LynxContext2d(this, this._dpr);
    }
    resize(width, height) {
        this._pixelWidth = width * this._dpr, this._pixelHeight = height * this._dpr, this._displayWidth = width, 
        this._displayHeight = height, this._nativeCanvas.width = this._pixelWidth, this._nativeCanvas.height = this._pixelHeight, 
        this._nativeCanvas.nativeCanvas && (this._nativeCanvas.nativeCanvas.width = this._pixelWidth, 
        this._nativeCanvas.nativeCanvas.height = this._pixelHeight);
        this._context.dpr = this._dpr;
    }
    release(...params) {}
};

LynxCanvas.env = "lynx", LynxCanvas = __decorate([ injectable(), __metadata("design:paramtypes", [ Object ]) ], LynxCanvas);

export { LynxCanvas };
//# sourceMappingURL=canvas.js.map
