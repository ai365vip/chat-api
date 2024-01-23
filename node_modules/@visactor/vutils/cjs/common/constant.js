"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isFunction_1 = __importDefault(require("./isFunction")), constant = value => (0, 
isFunction_1.default)(value) ? value : () => value;

exports.default = constant;
//# sourceMappingURL=constant.js.map