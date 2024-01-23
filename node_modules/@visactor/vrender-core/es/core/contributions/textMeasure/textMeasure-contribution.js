var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { injectable } from "../../../common/inversify-lite";

import { ATextMeasure } from "./AtextMeasure";

export const TextMeasureContribution = Symbol.for("TextMeasureContribution");

let DefaultTextMeasureContribution = class extends ATextMeasure {};

DefaultTextMeasureContribution = __decorate([ injectable() ], DefaultTextMeasureContribution);

export { DefaultTextMeasureContribution };
//# sourceMappingURL=textMeasure-contribution.js.map
