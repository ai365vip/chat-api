import isArray from "./isArray";

import isFunction from "./isFunction";

import isPlainObject from "./isPlainObject";

function objToString(obj) {
    return Object.prototype.toString.call(obj);
}

function objectKeys(obj) {
    return Object.keys(obj);
}

export function isEqual(a, b, options) {
    if (a === b) return !0;
    if (typeof a != typeof b) return !1;
    if (null == a || null == b) return !1;
    if (Number.isNaN(a) && Number.isNaN(b)) return !0;
    if (objToString(a) !== objToString(b)) return !1;
    if (isFunction(a)) return !!(null == options ? void 0 : options.skipFunction);
    if ("object" != typeof a) return !1;
    if (isArray(a)) {
        if (a.length !== b.length) return !1;
        for (let i = a.length - 1; i >= 0; i--) if (!isEqual(a[i], b[i], options)) return !1;
        return !0;
    }
    if (!isPlainObject(a)) return !1;
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
//# sourceMappingURL=isEqual.js.map