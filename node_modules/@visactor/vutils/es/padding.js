import isValidNumber from "./common/isValidNumber";

import isArray from "./common/isArray";

import isObject from "./common/isObject";

export function normalizePadding(padding) {
    if (isValidNumber(padding)) return [ padding, padding, padding, padding ];
    if (isArray(padding)) {
        const length = padding.length;
        if (1 === length) {
            const paddingValue = padding[0];
            return [ paddingValue, paddingValue, paddingValue, paddingValue ];
        }
        if (2 === length) {
            const [vertical, horizontal] = padding;
            return [ vertical, horizontal, vertical, horizontal ];
        }
        if (3 === length) {
            const [top, horizontal, bottom] = padding;
            return [ top, horizontal, bottom, horizontal ];
        }
        if (4 === length) return padding;
    }
    if (isObject(padding)) {
        const {top: top = 0, right: right = 0, bottom: bottom = 0, left: left = 0} = padding;
        return [ top, right, bottom, left ];
    }
    return [ 0, 0, 0, 0 ];
}
//# sourceMappingURL=padding.js.map