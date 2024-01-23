"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultMathTextPicker = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

let DefaultMathTextPicker = class {
    constructor() {
        this.type = "text", this.numberType = vrender_core_1.TEXT_NUMBER_TYPE;
    }
    contains(text, point, params) {
        return !!text.AABBBounds.containsPoint(point);
    }
};

DefaultMathTextPicker = __decorate([ (0, vrender_core_1.injectable)() ], DefaultMathTextPicker), 
exports.DefaultMathTextPicker = DefaultMathTextPicker;
//# sourceMappingURL=text-picker.js.map
