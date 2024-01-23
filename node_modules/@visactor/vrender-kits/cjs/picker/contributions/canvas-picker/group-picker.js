"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultCanvasGroupPicker = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

let DefaultCanvasGroupPicker = class {
    constructor() {
        this.type = "group", this.numberType = vrender_core_1.GROUP_NUMBER_TYPE;
    }
    contains(group, point, params) {
        return !1;
    }
};

DefaultCanvasGroupPicker = __decorate([ (0, vrender_core_1.injectable)() ], DefaultCanvasGroupPicker), 
exports.DefaultCanvasGroupPicker = DefaultCanvasGroupPicker;
//# sourceMappingURL=group-picker.js.map
