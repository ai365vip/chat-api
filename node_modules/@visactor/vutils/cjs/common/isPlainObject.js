"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isObjectLike_1 = __importDefault(require("./isObjectLike")), isType_1 = __importDefault(require("./isType")), isPlainObject = function(value) {
    if (!(0, isObjectLike_1.default)(value) || !(0, isType_1.default)(value, "Object")) return !1;
    if (null === Object.getPrototypeOf(value)) return !0;
    let proto = value;
    for (;null !== Object.getPrototypeOf(proto); ) proto = Object.getPrototypeOf(proto);
    return Object.getPrototypeOf(value) === proto;
};

exports.default = isPlainObject;
//# sourceMappingURL=isPlainObject.js.map