import isArray from "./isArray";

import isObject from "./isObject";

function is(x, y) {
    return x === y ? 0 !== x || 0 !== y || 1 / x == 1 / y : x != x && y != y;
}

function length(obj) {
    return isArray(obj) ? obj.length : isObject(obj) ? Object.keys(obj).length : 0;
}

export function isShallowEqual(objA, objB) {
    if (is(objA, objB)) return !0;
    if ("object" != typeof objA || null === objA || "object" != typeof objB || null === objB) return !1;
    if (isArray(objA) !== isArray(objB)) return !1;
    if (length(objA) !== length(objB)) return !1;
    let ret = !0;
    return Object.keys(objA).forEach((k => !!is(objA[k], objB[k]) || (ret = !1, ret))), 
    ret;
}
//# sourceMappingURL=isShallowEqual.js.map