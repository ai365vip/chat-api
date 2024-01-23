"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isString = (value, fuzzy = !1) => {
    const type = typeof value;
    return fuzzy ? "string" === type : "string" === type || (0, isType_1.default)(value, "String");
};

exports.default = isString;
//# sourceMappingURL=isString.js.map