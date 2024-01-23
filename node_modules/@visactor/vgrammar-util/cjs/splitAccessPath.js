"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.splitAccessPath = void 0;

const error_1 = require("./error"), splitAccessPath = p => {
    const path = [], n = p.length;
    let i, j, c, q = null, b = 0, s = "";
    p += "";
    const push = () => {
        path.push(s + p.substring(i, j)), s = "", i = j + 1;
    };
    for (i = 0, j = 0; j < n; j += 1) if (c = p[j], "\\" === c) s += p.substring(i, j), 
    s += p.substring(++j, ++j), i = j; else if (c === q) push(), q = null, b = -1; else {
        if (q) continue;
        i === b && '"' === c || i === b && "'" === c ? (i = j + 1, q = c) : "." !== c || b ? "[" === c ? (j > i && push(), 
        i = j + 1, b = i) : "]" === c && (b || (0, error_1.error)("Access path missing open bracket: " + p), 
        b > 0 && push(), b = 0, i = j + 1) : j > i ? push() : i = j + 1;
    }
    return b && (0, error_1.error)("Access path missing closing bracket: " + p), q && (0, 
    error_1.error)("Access path missing closing quote: " + p), j > i && (j += 1, push()), 
    path;
};

exports.splitAccessPath = splitAccessPath;
//# sourceMappingURL=splitAccessPath.js.map