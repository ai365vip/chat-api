"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CanvasTextLayout = void 0, __exportStar(require("./env/base-contribution"), exports), 
__exportStar(require("./window/base-contribution"), exports), __exportStar(require("./textMeasure/textMeasure-contribution"), exports);

var layout_1 = require("./textMeasure/layout");

Object.defineProperty(exports, "CanvasTextLayout", {
    enumerable: !0,
    get: function() {
        return layout_1.CanvasTextLayout;
    }
});
//# sourceMappingURL=index.js.map
