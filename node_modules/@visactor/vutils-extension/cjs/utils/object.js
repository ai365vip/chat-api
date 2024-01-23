"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getProperty = exports.setProperty = exports.includeSpec = void 0;

const vutils_1 = require("@visactor/vutils"), includeSpec = (spec, searchSpec) => spec === searchSpec || !(0, 
vutils_1.isFunction)(spec) && !(0, vutils_1.isFunction)(searchSpec) && ((0, vutils_1.isArray)(spec) && (0, 
vutils_1.isArray)(searchSpec) ? searchSpec.every((searchItem => spec.some((item => (0, 
exports.includeSpec)(item, searchItem))))) : !(!(0, vutils_1.isObject)(spec) || !(0, 
vutils_1.isObject)(searchSpec)) && Object.keys(searchSpec).every((key => (0, exports.includeSpec)(spec[key], searchSpec[key]))));

exports.includeSpec = includeSpec;

const setProperty = (target, path, value) => {
    if ((0, vutils_1.isNil)(path)) return target;
    const key = path[0];
    return (0, vutils_1.isNil)(key) ? target : 1 === path.length ? (target[key] = value, 
    target) : ((0, vutils_1.isNil)(target[key]) && ("number" == typeof path[1] ? target[key] = [] : target[key] = {}), 
    (0, exports.setProperty)(target[key], path.slice(1), value));
};

exports.setProperty = setProperty;

const getProperty = (target, path, defaultValue) => {
    if (!(0, vutils_1.isNil)(path)) return (0, vutils_1.get)(target, path, defaultValue);
};

exports.getProperty = getProperty;
//# sourceMappingURL=object.js.map