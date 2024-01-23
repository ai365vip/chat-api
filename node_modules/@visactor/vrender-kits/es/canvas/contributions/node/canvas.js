var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
};

import { injectable, BaseCanvas } from "@visactor/vrender-core";

import { NodeContext2d } from "./context";

import { isFunction } from "@visactor/vutils";

let NodeCanvas = class extends BaseCanvas {
    constructor(params) {
        super(params);
    }
    init() {
        this._context = new NodeContext2d(this, this._dpr), this.nativeCanvas.width = this._pixelWidth, 
        this.nativeCanvas.height = this._pixelHeight;
    }
    release(...params) {
        this._nativeCanvas.release && isFunction(this._nativeCanvas.release) && this._nativeCanvas.release();
    }
};

NodeCanvas.env = "node", NodeCanvas = __decorate([ injectable(), __metadata("design:paramtypes", [ Object ]) ], NodeCanvas);

export { NodeCanvas };
//# sourceMappingURL=canvas.js.map
