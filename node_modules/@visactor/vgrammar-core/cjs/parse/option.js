"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.parseOptions = exports.parseOptionValue = void 0;

const vutils_1 = require("@visactor/vutils"), util_1 = require("./util"), parseOptionValue = (value, params) => (0, 
util_1.isGrammar)(value) ? value.output() : value && (0, vutils_1.isObject)(value) ? (0, 
vutils_1.isFunction)(value.callback) ? datum => value.callback(datum, params) : (0, 
vutils_1.isFunction)(value.value) ? value.value(params) : value : value;

exports.parseOptionValue = parseOptionValue;

const parseOptions = (options, params) => options ? (0, vutils_1.isObject)(options) ? Object.keys(options).reduce(((res, key) => {
    const option = options[key];
    return res[key] = (0, exports.parseOptionValue)(option, params), res;
}), {}) : options.map((option => (0, exports.parseOptionValue)(option, params))) : options;

exports.parseOptions = parseOptions;
//# sourceMappingURL=option.js.map
