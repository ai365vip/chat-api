import { isArray, isFunction } from "@visactor/vutils";

import { accessor } from "./accessor";

import { getter } from "./getter";

import { splitAccessPath } from "./splitAccessPath";

const fieldSingle = (fieldStr, name, opt = {}) => {
    if (isFunction(fieldStr)) return fieldStr;
    const path = splitAccessPath(fieldStr), parsedField = 1 === path.length ? path[0] : fieldStr;
    return accessor((opt && opt.get || getter)(path), [ parsedField ], name || parsedField);
};

export const field = (fieldStr, name, opt = {}) => {
    if (isArray(fieldStr)) {
        const funcs = fieldStr.map((entry => fieldSingle(entry, name, opt)));
        return datum => funcs.map((func => func(datum)));
    }
    return fieldSingle(fieldStr, name, opt);
};
//# sourceMappingURL=field.js.map