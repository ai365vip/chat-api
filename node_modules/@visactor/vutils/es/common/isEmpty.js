import isNil from "./isNil";

import isArrayLike from "./isArrayLike";

import getType from "./getType";

import isPrototype from "./isPrototype";

const hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(value) {
    if (isNil(value)) return !0;
    if (isArrayLike(value)) return !value.length;
    const type = getType(value);
    if ("Map" === type || "Set" === type) return !value.size;
    if (isPrototype(value)) return !Object.keys(value).length;
    for (const key in value) if (hasOwnProperty.call(value, key)) return !1;
    return !0;
}

export default isEmpty;
//# sourceMappingURL=isEmpty.js.map