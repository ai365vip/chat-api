"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isPlainObject_1 = __importDefault(require("./isPlainObject")), isString_1 = __importDefault(require("./isString"));

function pickWithout(obj, keys) {
    if (!obj || !(0, isPlainObject_1.default)(obj)) return obj;
    const result = {};
    return Object.keys(obj).forEach((k => {
        const v = obj[k];
        let match = !1;
        keys.forEach((itKey => {
            ((0, isString_1.default)(itKey) && itKey === k || itKey instanceof RegExp && k.match(itKey)) && (match = !0);
        })), match || (result[k] = v);
    })), result;
}

exports.default = pickWithout;
//# sourceMappingURL=pickWithout.js.map
