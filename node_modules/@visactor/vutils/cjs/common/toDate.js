"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.toDate = void 0;

const isNil_1 = __importDefault(require("./isNil")), isString_1 = __importDefault(require("./isString")), TIME_REG = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;

function toDate(val) {
    if (val instanceof Date) return val;
    if ((0, isString_1.default)(val)) {
        const match = TIME_REG.exec(val);
        if (!match) return new Date(NaN);
        if (!match[8]) return new Date(+match[1], +(match[2] || 1) - 1, +match[3] || 1, +match[4] || 0, +(match[5] || 0), +match[6] || 0, match[7] ? +match[7].substring(0, 3) : 0);
        let hour = +match[4] || 0;
        return "Z" !== match[8].toUpperCase() && (hour -= +match[8].slice(0, 3)), new Date(Date.UTC(+match[1], +(match[2] || 1) - 1, +match[3] || 1, hour, +(match[5] || 0), +match[6] || 0, match[7] ? +match[7].substring(0, 3) : 0));
    }
    return (0, isNil_1.default)(val) ? new Date(NaN) : new Date(Math.round(val));
}

exports.toDate = toDate;
//# sourceMappingURL=toDate.js.map
