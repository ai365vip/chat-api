import isPlainObject from "./isPlainObject";

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default function pick(obj, keys) {
    if (!obj || !isPlainObject(obj)) return obj;
    const result = {};
    return keys.forEach((k => {
        hasOwnProperty.call(obj, k) && (result[k] = obj[k]);
    })), result;
}
//# sourceMappingURL=pick.js.map
