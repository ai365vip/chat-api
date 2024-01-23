"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isRegExp = value => (0, isType_1.default)(value, "RegExp");

exports.default = isRegExp;
//# sourceMappingURL=isRegExp.js.map