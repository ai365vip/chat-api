"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isPlainObject_1 = __importDefault(require("./isPlainObject")), hasOwnProperty = Object.prototype.hasOwnProperty;

function pick(obj, keys) {
    if (!obj || !(0, isPlainObject_1.default)(obj)) return obj;
    const result = {};
    return keys.forEach((k => {
        hasOwnProperty.call(obj, k) && (result[k] = obj[k]);
    })), result;
}

exports.default = pick;
//# sourceMappingURL=pick.js.map
