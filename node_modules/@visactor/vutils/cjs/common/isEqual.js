"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isEqual = void 0;

const isArray_1 = __importDefault(require("./isArray")), isFunction_1 = __importDefault(require("./isFunction")), isPlainObject_1 = __importDefault(require("./isPlainObject"));

function objToString(obj) {
    return Object.prototype.toString.call(obj);
}

function objectKeys(obj) {
    return Object.keys(obj);
}

function isEqual(a, b, options) {
    if (a === b) return !0;
    if (typeof a != typeof b) return !1;
    if (null == a || null == b) return !1;
    if (Number.isNaN(a) && Number.isNaN(b)) return !0;
    if (objToString(a) !== objToString(b)) return !1;
    if ((0, isFunction_1.default)(a)) return !!(null == options ? void 0 : options.skipFunction);
    if ("object" != typeof a) return !1;
    if ((0, isArray_1.default)(a)) {
        if (a.length !== b.length) return !1;
        for (let i = a.length - 1; i >= 0; i--) if (!isEqual(a[i], b[i], options)) return !1;
        return !0;
    }
    if (!(0, isPlainObject_1.default)(a)) return !1;
    const ka = objectKeys(a), kb = objectKeys(b);
    if (ka.length !== kb.length) return !1;
    ka.sort(), kb.sort();
    for (let i = ka.length - 1; i >= 0; i--) if (ka[i] != kb[i]) return !1;
    for (let i = ka.length - 1; i >= 0; i--) {
        const key = ka[i];
        if (!isEqual(a[key], b[key], options)) return !1;
    }
    return !0;
}

exports.isEqual = isEqual;
//# sourceMappingURL=isEqual.js.map