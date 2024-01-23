import isObjectLike from "./isObjectLike";

import isType from "./isType";

const isPlainObject = function(value) {
    if (!isObjectLike(value) || !isType(value, "Object")) return !1;
    if (null === Object.getPrototypeOf(value)) return !0;
    let proto = value;
    for (;null !== Object.getPrototypeOf(proto); ) proto = Object.getPrototypeOf(proto);
    return Object.getPrototypeOf(value) === proto;
};

export default isPlainObject;
//# sourceMappingURL=isPlainObject.js.map