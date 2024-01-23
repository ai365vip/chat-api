"use strict";

function substitute(str, o) {
    return str && o ? str.replace(/\\?\{([^{}]+)\}/g, ((match, name) => "\\" === match.charAt(0) ? match.slice(1) : void 0 === o[name] ? "" : o[name])) : str;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = substitute;
//# sourceMappingURL=substitute.js.map
