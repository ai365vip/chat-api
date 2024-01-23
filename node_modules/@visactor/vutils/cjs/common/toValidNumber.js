"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.toValidNumber = void 0;

const isValidNumber_1 = __importDefault(require("./isValidNumber"));

function toValidNumber(v) {
    if ((0, isValidNumber_1.default)(v)) return v;
    const value = +v;
    return (0, isValidNumber_1.default)(value) ? value : 0;
}

exports.toValidNumber = toValidNumber;
//# sourceMappingURL=toValidNumber.js.map
