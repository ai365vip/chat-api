import isType from "./isType";

const isNumber = (value, fuzzy = !1) => {
    const type = typeof value;
    return fuzzy ? "number" === type : "number" === type || isType(value, "Number");
};

export default isNumber;
//# sourceMappingURL=isNumber.js.map