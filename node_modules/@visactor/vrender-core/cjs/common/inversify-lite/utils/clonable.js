"use strict";

function isClonable(obj) {
    return "object" == typeof obj && null !== obj && "clone" in obj && "function" == typeof obj.clone;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isClonable = void 0, exports.isClonable = isClonable;
//# sourceMappingURL=clonable.js.map
