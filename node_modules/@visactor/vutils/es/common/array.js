import isArray from "./isArray";

import isArrayLike from "./isArrayLike";

import isValid from "./isValid";

export function array(arr) {
    return isValid(arr) ? isArray(arr) ? arr : [ arr ] : [];
}

export function last(val) {
    if (isArrayLike(val)) {
        return val[val.length - 1];
    }
}

export const span = arr => arr.length <= 1 ? 0 : last(arr) - arr[0];

export const maxInArray = (arr, compareFn) => {
    var _a;
    if (0 === arr.length) return;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const value = arr[i];
        (null !== (_a = null == compareFn ? void 0 : compareFn(value, max)) && void 0 !== _a ? _a : value - max > 0) && (max = value);
    }
    return max;
};

export const minInArray = (arr, compareFn) => {
    var _a;
    if (0 === arr.length) return;
    let min = arr[0];
    for (let i = 1; i < arr.length; i++) {
        const value = arr[i];
        (null !== (_a = null == compareFn ? void 0 : compareFn(value, min)) && void 0 !== _a ? _a : value - min < 0) && (min = value);
    }
    return min;
};

export function arrayEqual(a, b) {
    if (!isArray(a) || !isArray(b)) return !1;
    if (a.length !== b.length) return !1;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
    return !0;
}

export function uniqArray(arr) {
    return arr && isArray(arr) ? Array.from(new Set(array(arr))) : arr;
}

export function shuffleArray(arr, random = Math.random) {
    let j, x, i = arr.length;
    for (;i; ) j = Math.floor(random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x;
    return arr;
}

export function flattenArray(arr) {
    if (!isArray(arr)) return [ arr ];
    const result = [];
    for (const value of arr) result.push(...flattenArray(value));
    return result;
}
//# sourceMappingURL=array.js.map