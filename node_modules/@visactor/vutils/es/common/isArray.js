import isType from "./isType";

const isArray = value => Array.isArray ? Array.isArray(value) : isType(value, "Array");

export default isArray;
//# sourceMappingURL=isArray.js.map