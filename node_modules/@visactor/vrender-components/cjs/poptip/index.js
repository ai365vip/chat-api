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
}), exports.loadPoptip = exports.setPoptipTheme = void 0, __exportStar(require("./poptip"), exports), 
__exportStar(require("./type"), exports);

var register_1 = require("./register");

Object.defineProperty(exports, "setPoptipTheme", {
    enumerable: !0,
    get: function() {
        return register_1.setPoptipTheme;
    }
});

var module_1 = require("./module");

Object.defineProperty(exports, "loadPoptip", {
    enumerable: !0,
    get: function() {
        return module_1.loadPoptip;
    }
});
//# sourceMappingURL=index.js.map
