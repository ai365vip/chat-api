"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isDataDomainSpec = exports.isNumeric = exports.toValidNumber = exports.couldBeValidNumber = exports.isPlainObject = exports.isValidNumber = exports.isArrayLike = exports.isValid = exports.isNil = exports.isNull = exports.isUndefined = exports.isDate = exports.isBoolean = exports.isRegExp = exports.isNumber = exports.isString = exports.isArray = exports.isFunction = exports.isObject = void 0;

const vutils_1 = require("@visactor/vutils");

function couldBeValidNumber(v) {
    return null != v && "" !== v && (!!(0, vutils_1.isNumber)(v) || +v == +v);
}

function toValidNumber(v) {
    if ((0, vutils_1.isValidNumber)(v)) return v;
    const value = +v;
    return (0, vutils_1.isValidNumber)(value) ? value : 0;
}

function isNumeric(value) {
    return "string" == typeof value && (!isNaN(Number(value)) && !isNaN(parseFloat(value)));
}

function isDataDomainSpec(domain) {
    return !(!domain || 0 === domain.length) && (!(0, vutils_1.isNil)(domain[0]) && !(0, 
    vutils_1.isNil)(domain[0].dataId) && (0, vutils_1.isArray)(domain[0].fields));
}

Object.defineProperty(exports, "isObject", {
    enumerable: !0,
    get: function() {
        return vutils_1.isObject;
    }
}), Object.defineProperty(exports, "isFunction", {
    enumerable: !0,
    get: function() {
        return vutils_1.isFunction;
    }
}), Object.defineProperty(exports, "isArray", {
    enumerable: !0,
    get: function() {
        return vutils_1.isArray;
    }
}), Object.defineProperty(exports, "isString", {
    enumerable: !0,
    get: function() {
        return vutils_1.isString;
    }
}), Object.defineProperty(exports, "isNumber", {
    enumerable: !0,
    get: function() {
        return vutils_1.isNumber;
    }
}), Object.defineProperty(exports, "isRegExp", {
    enumerable: !0,
    get: function() {
        return vutils_1.isRegExp;
    }
}), Object.defineProperty(exports, "isBoolean", {
    enumerable: !0,
    get: function() {
        return vutils_1.isBoolean;
    }
}), Object.defineProperty(exports, "isDate", {
    enumerable: !0,
    get: function() {
        return vutils_1.isDate;
    }
}), Object.defineProperty(exports, "isUndefined", {
    enumerable: !0,
    get: function() {
        return vutils_1.isUndefined;
    }
}), Object.defineProperty(exports, "isNull", {
    enumerable: !0,
    get: function() {
        return vutils_1.isNull;
    }
}), Object.defineProperty(exports, "isNil", {
    enumerable: !0,
    get: function() {
        return vutils_1.isNil;
    }
}), Object.defineProperty(exports, "isValid", {
    enumerable: !0,
    get: function() {
        return vutils_1.isValid;
    }
}), Object.defineProperty(exports, "isArrayLike", {
    enumerable: !0,
    get: function() {
        return vutils_1.isArrayLike;
    }
}), Object.defineProperty(exports, "isValidNumber", {
    enumerable: !0,
    get: function() {
        return vutils_1.isValidNumber;
    }
}), Object.defineProperty(exports, "isPlainObject", {
    enumerable: !0,
    get: function() {
        return vutils_1.isPlainObject;
    }
}), exports.couldBeValidNumber = couldBeValidNumber, exports.toValidNumber = toValidNumber, 
exports.isNumeric = isNumeric, exports.isDataDomainSpec = isDataDomainSpec;
//# sourceMappingURL=type.js.map
