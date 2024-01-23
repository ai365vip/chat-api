"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.flattenArray = exports.shuffleArray = exports.uniqArray = exports.arrayEqual = exports.minInArray = exports.maxInArray = exports.span = exports.last = exports.array = void 0;

const isArray_1 = __importDefault(require("./isArray")), isArrayLike_1 = __importDefault(require("./isArrayLike")), isValid_1 = __importDefault(require("./isValid"));

function array(arr) {
    return (0, isValid_1.default)(arr) ? (0, isArray_1.default)(arr) ? arr : [ arr ] : [];
}

function last(val) {
    if ((0, isArrayLike_1.default)(val)) {
        return val[val.length - 1];
    }
}

exports.array = array, exports.last = last;

const span = arr => arr.length <= 1 ? 0 : last(arr) - arr[0];

exports.span = span;

const maxInArray = (arr, compareFn) => {
    var _a;
    if (0 === arr.length) return;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const value = arr[i];
        (null !== (_a = null == compareFn ? void 0 : compareFn(value, max)) && void 0 !== _a ? _a : value - max > 0) && (max = value);
    }
    return max;
};

exports.maxInArray = maxInArray;

const minInArray = (arr, compareFn) => {
    var _a;
    if (0 === arr.length) return;
    let min = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const value = arr[i];
        (null !== (_a = null == compareFn ? void 0 : compareFn(value, min)) && void 0 !== _a ? _a : value - min < 0) && (min = value);
    }
    return min;
};

function arrayEqual(a, b) {
    if (!(0, isArray_1.default)(a) || !(0, isArray_1.default)(b)) return !1;
    if (a.length !== b.length) return !1;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
    return !0;
}

function uniqArray(arr) {
    return arr && (0, isArray_1.default)(arr) ? Array.from(new Set(array(arr))) : arr;
}

function shuffleArray(arr, random = Math.random) {
    let j, x, i = arr.length;
    for (;i; ) j = Math.floor(random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x;
    return arr;
}

function flattenArray(arr) {
    if (!(0, isArray_1.default)(arr)) return [ arr ];
    const result = [];
    for (const value of arr) result.push(...flattenArray(value));
    return result;
}

exports.minInArray = minInArray, exports.arrayEqual = arrayEqual, exports.uniqArray = uniqArray, 
exports.shuffleArray = shuffleArray, exports.flattenArray = flattenArray;
//# sourceMappingURL=array.js.map