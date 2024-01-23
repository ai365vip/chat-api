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
}), exports.NodeContext2d = void 0;

const vutils_1 = require("@visactor/vutils"), vrender_core_1 = require("@visactor/vrender-core"), browser_1 = require("../browser");

let NodeContext2d = class extends browser_1.BrowserContext2d {
    constructor(canvas, dpr) {
        super(canvas, dpr);
        const context = canvas.nativeCanvas.getContext("2d");
        if (!context) throw new Error("发生错误，获取2d上下文失败");
        this.nativeContext = context, this.canvas = canvas, this.matrix = new vutils_1.Matrix(1, 0, 0, 1, 0, 0), 
        this.stack = [], this.dpr = null != dpr ? dpr : 1;
    }
    release(...params) {}
};

NodeContext2d.env = "node", NodeContext2d = __decorate([ (0, vrender_core_1.injectable)(), __metadata("design:paramtypes", [ Object, Number ]) ], NodeContext2d), 
exports.NodeContext2d = NodeContext2d;
//# sourceMappingURL=context.js.map
