import { isObject, isFunction, isArray, isString, isNumber, isRegExp, isBoolean, isDate, isUndefined, isNull, isNil, isValid, isArrayLike, isValidNumber, isPlainObject } from "@visactor/vutils";

export { isObject, isFunction, isArray, isString, isNumber, isRegExp, isBoolean, isDate, isUndefined, isNull, isNil, isValid, isArrayLike, isValidNumber, isPlainObject };

export function couldBeValidNumber(v) {
    return null != v && "" !== v && (!!isNumber(v) || +v == +v);
}

export function toValidNumber(v) {
    if (isValidNumber(v)) return v;
    const value = +v;
    return isValidNumber(value) ? value : 0;
}

export function isNumeric(value) {
    return "string" == typeof value && (!isNaN(Number(value)) && !isNaN(parseFloat(value)));
}

export function isDataDomainSpec(domain) {
    return !(!domain || 0 === domain.length) && (!isNil(domain[0]) && !isNil(domain[0].dataId) && isArray(domain[0].fields));
}
//# sourceMappingURL=type.js.map
