"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vutils_1 = require("@visactor/vutils"), vgrammar_util_1 = require("@visactor/vgrammar-util"), transform = (options, data) => {
    const logger = vutils_1.Logger.getInstance();
    let as = options.as;
    const {fields: fields, from: from, key: key, values: values} = options, keyAccessor = (0, 
    vgrammar_util_1.field)(key), indexMap = (from || []).reduce(((map, tuple) => (map[keyAccessor(tuple)] = tuple, 
    map)), {}), defaultValue = (0, vutils_1.isNil)(options.default) ? null : options.default, fieldAccessors = fields.map((field => (0, 
    vgrammar_util_1.field)(field)));
    if (values) {
        fields.length > 1 && !as && logger.error('Multi-field lookup requires explicit "as" parameter.'), 
        as && as.length !== fields.length * values.length && logger.error('The "as" parameter has too few output field names.'), 
        (0, vutils_1.isNil)(as) && (as = values);
        const valuesAccessors = values.map((value => (0, vgrammar_util_1.field)(value)));
        return data.map((entry => fieldAccessors.reduce(((res, fieldAccessor, fieldIndex) => {
            const value = indexMap[fieldAccessor(entry)], valuesLength = values.length;
            return ((0, vutils_1.isNil)(value) ? valuesAccessors.map((valuesAccessor => defaultValue)) : valuesAccessors.map((valuesAccessor => valuesAccessor(value)))).reduce(((asRes, asValue, asIndex) => (asRes[as[fieldIndex * valuesLength + asIndex]] = asValue, 
            asRes)), res);
        }), entry)));
    }
    return as || logger.error("Missing output field names."), data.map((entry => fieldAccessors.reduce(((res, fieldAccessor, fieldIndex) => {
        const value = indexMap[fieldAccessor(entry)];
        return res[as[fieldIndex]] = (0, vutils_1.isNil)(value) ? defaultValue : value, 
        res;
    }), entry)));
};

exports.transform = transform;
//# sourceMappingURL=join.js.map
