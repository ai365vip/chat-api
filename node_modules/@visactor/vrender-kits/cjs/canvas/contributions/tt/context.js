"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.TTContext2d = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), feishu_1 = require("../feishu");

let TTContext2d = class extends feishu_1.FeishuContext2d {};

TTContext2d.env = "tt", TTContext2d = __decorate([ (0, vrender_core_1.injectable)() ], TTContext2d), 
exports.TTContext2d = TTContext2d;
//# sourceMappingURL=context.js.map
