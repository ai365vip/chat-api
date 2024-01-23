"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.normalizePadding = void 0;

const isValidNumber_1 = __importDefault(require("./common/isValidNumber")), isArray_1 = __importDefault(require("./common/isArray")), isObject_1 = __importDefault(require("./common/isObject"));

function normalizePadding(padding) {
    if ((0, isValidNumber_1.default)(padding)) return [ padding, padding, padding, padding ];
    if ((0, isArray_1.default)(padding)) {
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
    if ((0, isObject_1.default)(padding)) {
        const {top: top = 0, right: right = 0, bottom: bottom = 0, left: left = 0} = padding;
        return [ top, right, bottom, left ];
    }
    return [ 0, 0, 0, 0 ];
}

exports.normalizePadding = normalizePadding;
//# sourceMappingURL=padding.js.map