import isType from "./isType";

const isString = (value, fuzzy = !1) => {
    const type = typeof value;
    return fuzzy ? "string" === type : "string" === type || isType(value, "String");
};

export default isString;
//# sourceMappingURL=isString.js.map