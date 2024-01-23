import isNil from "./isNil";

import isString from "./isString";

const TIME_REG = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;

export function toDate(val) {
    if (val instanceof Date) return val;
    if (isString(val)) {
        const match = TIME_REG.exec(val);
        if (!match) return new Date(NaN);
        if (!match[8]) return new Date(+match[1], +(match[2] || 1) - 1, +match[3] || 1, +match[4] || 0, +(match[5] || 0), +match[6] || 0, match[7] ? +match[7].substring(0, 3) : 0);
        let hour = +match[4] || 0;
        return "Z" !== match[8].toUpperCase() && (hour -= +match[8].slice(0, 3)), new Date(Date.UTC(+match[1], +(match[2] || 1) - 1, +match[3] || 1, hour, +(match[5] || 0), +match[6] || 0, match[7] ? +match[7].substring(0, 3) : 0));
    }
    return isNil(val) ? new Date(NaN) : new Date(Math.round(val));
}
//# sourceMappingURL=toDate.js.map
