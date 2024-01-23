"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isBoolean = (value, fuzzy = !1) => fuzzy ? "boolean" == typeof value : !0 === value || !1 === value || (0, 
isType_1.default)(value, "Boolean");

exports.default = isBoolean;
//# sourceMappingURL=isBoolean.js.map