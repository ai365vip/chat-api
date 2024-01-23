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
}), exports.rgbToHsl = exports.rgbToHex = exports.hslToRgb = exports.hexToRgb = exports.DEFAULT_COLORS = exports.RGB = exports.Color = void 0;

var Color_1 = require("./Color");

Object.defineProperty(exports, "Color", {
    enumerable: !0,
    get: function() {
        return Color_1.Color;
    }
}), Object.defineProperty(exports, "RGB", {
    enumerable: !0,
    get: function() {
        return Color_1.RGB;
    }
}), Object.defineProperty(exports, "DEFAULT_COLORS", {
    enumerable: !0,
    get: function() {
        return Color_1.DEFAULT_COLORS;
    }
});

var hexToRgb_1 = require("./hexToRgb");

Object.defineProperty(exports, "hexToRgb", {
    enumerable: !0,
    get: function() {
        return __importDefault(hexToRgb_1).default;
    }
});

var hslToRgb_1 = require("./hslToRgb");

Object.defineProperty(exports, "hslToRgb", {
    enumerable: !0,
    get: function() {
        return __importDefault(hslToRgb_1).default;
    }
});

var rgbToHex_1 = require("./rgbToHex");

Object.defineProperty(exports, "rgbToHex", {
    enumerable: !0,
    get: function() {
        return __importDefault(rgbToHex_1).default;
    }
});

var rgbToHsl_1 = require("./rgbToHsl");

Object.defineProperty(exports, "rgbToHsl", {
    enumerable: !0,
    get: function() {
        return __importDefault(rgbToHsl_1).default;
    }
}), __exportStar(require("./interpolate"), exports);
//# sourceMappingURL=index.js.map