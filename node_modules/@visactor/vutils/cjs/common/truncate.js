"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNil_1 = __importDefault(require("./isNil")), truncate = (str, length, align = "right", ellipsis) => {
    const e = (0, isNil_1.default)(ellipsis) ? "…" : ellipsis, s = str + "", n = s.length, l = Math.max(0, length - e.length);
    return n <= length ? s : "left" === align ? e + s.slice(n - l) : "center" === align ? s.slice(0, Math.ceil(l / 2)) + e + s.slice(n - Math.floor(l / 2)) : s.slice(0, l) + e;
};

exports.default = truncate;
//# sourceMappingURL=truncate.js.map
