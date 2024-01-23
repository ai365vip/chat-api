var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

import { injectable, TEXT_NUMBER_TYPE } from "@visactor/vrender-core";

let DefaultMathTextPicker = class {
    constructor() {
        this.type = "text", this.numberType = TEXT_NUMBER_TYPE;
    }
    contains(text, point, params) {
        return !!text.AABBBounds.containsPoint(point);
    }
};

DefaultMathTextPicker = __decorate([ injectable() ], DefaultMathTextPicker);

export { DefaultMathTextPicker };
//# sourceMappingURL=text-picker.js.map
