import { isNil, Logger } from "@visactor/vutils";

import { field as getFieldAccessor } from "@visactor/vgrammar-util";

export const transform = (options, data) => {
    const logger = Logger.getInstance();
    let as = options.as;
    const {fields: fields, from: from, key: key, values: values} = options, keyAccessor = getFieldAccessor(key), indexMap = (from || []).reduce(((map, tuple) => (map[keyAccessor(tuple)] = tuple, 
    map)), {}), defaultValue = isNil(options.default) ? null : options.default, fieldAccessors = fields.map((field => getFieldAccessor(field)));
    if (values) {
        fields.length > 1 && !as && logger.error('Multi-field lookup requires explicit "as" parameter.'), 
        as && as.length !== fields.length * values.length && logger.error('The "as" parameter has too few output field names.'), 
        isNil(as) && (as = values);
        const valuesAccessors = values.map((value => getFieldAccessor(value)));
        return data.map((entry => fieldAccessors.reduce(((res, fieldAccessor, fieldIndex) => {
            const value = indexMap[fieldAccessor(entry)], valuesLength = values.length;
            return (isNil(value) ? valuesAccessors.map((valuesAccessor => defaultValue)) : valuesAccessors.map((valuesAccessor => valuesAccessor(value)))).reduce(((asRes, asValue, asIndex) => (asRes[as[fieldIndex * valuesLength + asIndex]] = asValue, 
            asRes)), res);
        }), entry)));
    }
    return as || logger.error("Missing output field names."), data.map((entry => fieldAccessors.reduce(((res, fieldAccessor, fieldIndex) => {
        const value = indexMap[fieldAccessor(entry)];
        return res[as[fieldIndex]] = isNil(value) ? defaultValue : value, res;
    }), entry)));
};
//# sourceMappingURL=join.js.map
