import isValidNumber from "./isValidNumber";

export function toValidNumber(v) {
    if (isValidNumber(v)) return v;
    const value = +v;
    return isValidNumber(value) ? value : 0;
}
//# sourceMappingURL=toValidNumber.js.map
