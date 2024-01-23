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
}), exports.getRulePoints = exports.getLinePoints = exports.Element = void 0, __exportStar(require("./enums"), exports);

var element_1 = require("./element");

Object.defineProperty(exports, "Element", {
    enumerable: !0,
    get: function() {
        return element_1.Element;
    }
});

var helpers_1 = require("./attributes/helpers");

Object.defineProperty(exports, "getLinePoints", {
    enumerable: !0,
    get: function() {
        return helpers_1.getLinePoints;
    }
}), Object.defineProperty(exports, "getRulePoints", {
    enumerable: !0,
    get: function() {
        return helpers_1.getRulePoints;
    }
});
//# sourceMappingURL=index.js.map