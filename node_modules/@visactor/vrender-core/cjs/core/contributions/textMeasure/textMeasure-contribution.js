"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultTextMeasureContribution = exports.TextMeasureContribution = void 0;

const inversify_lite_1 = require("../../../common/inversify-lite"), AtextMeasure_1 = require("./AtextMeasure");

exports.TextMeasureContribution = Symbol.for("TextMeasureContribution");

let DefaultTextMeasureContribution = class extends AtextMeasure_1.ATextMeasure {};

DefaultTextMeasureContribution = __decorate([ (0, inversify_lite_1.injectable)() ], DefaultTextMeasureContribution), 
exports.DefaultTextMeasureContribution = DefaultTextMeasureContribution;
//# sourceMappingURL=textMeasure-contribution.js.map
