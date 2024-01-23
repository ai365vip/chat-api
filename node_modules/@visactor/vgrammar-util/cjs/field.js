"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.field = void 0;

const vutils_1 = require("@visactor/vutils"), accessor_1 = require("./accessor"), getter_1 = require("./getter"), splitAccessPath_1 = require("./splitAccessPath"), fieldSingle = (fieldStr, name, opt = {}) => {
    if ((0, vutils_1.isFunction)(fieldStr)) return fieldStr;
    const path = (0, splitAccessPath_1.splitAccessPath)(fieldStr), parsedField = 1 === path.length ? path[0] : fieldStr;
    return (0, accessor_1.accessor)((opt && opt.get || getter_1.getter)(path), [ parsedField ], name || parsedField);
}, field = (fieldStr, name, opt = {}) => {
    if ((0, vutils_1.isArray)(fieldStr)) {
        const funcs = fieldStr.map((entry => fieldSingle(entry, name, opt)));
        return datum => funcs.map((func => func(datum)));
    }
    return fieldSingle(fieldStr, name, opt);
};

exports.field = field;
//# sourceMappingURL=field.js.map