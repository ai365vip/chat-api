"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.canvasAllocate = exports.DefaultCanvasAllocate = void 0;

const application_1 = require("../application"), util_1 = require("../canvas/util");

class DefaultCanvasAllocate {
    constructor() {
        this.pools = [], this.allocatedCanvas = [];
    }
    shareCanvas() {
        return this.allocatedCanvas.length ? this.allocatedCanvas[0] : this.getCommonCanvas();
    }
    getCommonCanvas() {
        return this._commonCanvas || (this._commonCanvas = this.allocate({
            width: 100,
            height: 100,
            dpr: 2
        })), this._commonCanvas;
    }
    allocate(data) {
        if (!this.pools.length) {
            const c = (0, util_1.wrapCanvas)(Object.assign({
                nativeCanvas: application_1.application.global.createCanvas(data)
            }, data));
            return this.allocatedCanvas.push(c), c;
        }
        const m = this.pools.pop();
        return m.resize(data.width, data.height), m.dpr = data.dpr, m;
    }
    allocateByObj(canvas) {
        if (!this.pools.length) {
            const data = {
                width: canvas.width / canvas.dpr,
                height: canvas.height / canvas.dpr,
                dpr: canvas.dpr
            }, c = (0, util_1.wrapCanvas)(Object.assign({
                nativeCanvas: application_1.application.global.createCanvas(data)
            }, data));
            return this.allocatedCanvas.push(c), c;
        }
        const m = this.pools.pop();
        return m.width = canvas.width, m.height = canvas.height, m;
    }
    free(d) {
        this.pools.push(d);
    }
    get length() {
        return this.pools.length;
    }
    release(...params) {
        this.pools = [];
    }
}

exports.DefaultCanvasAllocate = DefaultCanvasAllocate, exports.canvasAllocate = new DefaultCanvasAllocate;
//# sourceMappingURL=canvas-allocate.js.map