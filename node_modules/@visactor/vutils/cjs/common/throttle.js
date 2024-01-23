"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const debounce_1 = __importDefault(require("./debounce")), isObject_1 = __importDefault(require("./isObject"));

function throttle(func, wait, options) {
    let leading = !0, trailing = !0;
    if ("function" != typeof func) throw new TypeError("Expected a function");
    return (0, isObject_1.default)(options) && (leading = "leading" in options ? !!options.leading : leading, 
    trailing = "trailing" in options ? !!options.trailing : trailing), (0, debounce_1.default)(func, wait, {
        leading: leading,
        trailing: trailing,
        maxWait: wait
    });
}

exports.default = throttle;
//# sourceMappingURL=throttle.js.map
