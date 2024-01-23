"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.range = void 0;

const isValid_1 = __importDefault(require("./isValid"));

function range(start, stop, step) {
    (0, isValid_1.default)(stop) || (stop = start, start = 0), (0, isValid_1.default)(step) || (step = 1);
    let i = -1;
    const n = 0 | Math.max(0, Math.ceil((stop - start) / step)), range = new Array(n);
    for (;++i < n; ) range[i] = start + i * step;
    return range;
}

exports.range = range;
//# sourceMappingURL=range.js.map
