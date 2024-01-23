"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}, __param = this && this.__param || function(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultMathRichTextPicker = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

let DefaultMathRichTextPicker = class {
    constructor(canvasRenderer) {
        this.canvasRenderer = canvasRenderer, this.type = "richtext", this.numberType = vrender_core_1.RICHTEXT_NUMBER_TYPE;
    }
    contains(richtext, point, params) {
        return !!richtext.AABBBounds.containsPoint(point);
    }
};

DefaultMathRichTextPicker = __decorate([ (0, vrender_core_1.injectable)(), __param(0, (0, 
vrender_core_1.inject)(vrender_core_1.RichTextRender)), __metadata("design:paramtypes", [ Object ]) ], DefaultMathRichTextPicker), 
exports.DefaultMathRichTextPicker = DefaultMathRichTextPicker;
//# sourceMappingURL=richtext-picker.js.map
