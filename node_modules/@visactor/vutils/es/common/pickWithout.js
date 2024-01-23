import isPlainObject from "./isPlainObject";

import isString from "./isString";

export default function pickWithout(obj, keys) {
    if (!obj || !isPlainObject(obj)) return obj;
    const result = {};
    return Object.keys(obj).forEach((k => {
        const v = obj[k];
        let match = !1;
        keys.forEach((itKey => {
            (isString(itKey) && itKey === k || itKey instanceof RegExp && k.match(itKey)) && (match = !0);
        })), match || (result[k] = v);
    })), result;
}
//# sourceMappingURL=pickWithout.js.map
