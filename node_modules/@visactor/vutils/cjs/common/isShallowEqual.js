"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isShallowEqual = void 0;

const isArray_1 = __importDefault(require("./isArray")), isObject_1 = __importDefault(require("./isObject"));

function is(x, y) {
    return x === y ? 0 !== x || 0 !== y || 1 / x == 1 / y : x != x && y != y;
}

function length(obj) {
    return (0, isArray_1.default)(obj) ? obj.length : (0, isObject_1.default)(obj) ? Object.keys(obj).length : 0;
}

function isShallowEqual(objA, objB) {
    if (is(objA, objB)) return !0;
    if ("object" != typeof objA || null === objA || "object" != typeof objB || null === objB) return !1;
    if ((0, isArray_1.default)(objA) !== (0, isArray_1.default)(objB)) return !1;
    if (length(objA) !== length(objB)) return !1;
    let ret = !0;
    return Object.keys(objA).forEach((k => !!is(objA[k], objB[k]) || (ret = !1, ret))), 
    ret;
}

exports.isShallowEqual = isShallowEqual;
//# sourceMappingURL=isShallowEqual.js.map