import isType from "./isType";

const isBoolean = (value, fuzzy = !1) => fuzzy ? "boolean" == typeof value : !0 === value || !1 === value || isType(value, "Boolean");

export default isBoolean;
//# sourceMappingURL=isBoolean.js.map