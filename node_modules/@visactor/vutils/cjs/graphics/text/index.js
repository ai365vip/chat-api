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
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.eastAsianCharacterInfo = exports.stringWidth = void 0;

var stringWidth_1 = require("./stringWidth");

Object.defineProperty(exports, "stringWidth", {
    enumerable: !0,
    get: function() {
        return __importDefault(stringWidth_1).default;
    }
}), Object.defineProperty(exports, "eastAsianCharacterInfo", {
    enumerable: !0,
    get: function() {
        return stringWidth_1.eastAsianCharacterInfo;
    }
}), __exportStar(require("./measure"), exports);
//# sourceMappingURL=index.js.map
