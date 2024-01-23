"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.field = exports.cloneDeep = exports.pick = exports.get = void 0;

const vutils_1 = require("@visactor/vutils");

function field(f) {
    return function(datum) {
        let value;
        return value = (0, vutils_1.isArray)(f) ? f.reduce(((cur, g) => null == cur ? void 0 : cur[g]), datum) : null == datum ? void 0 : datum[f], 
        value;
    };
}

Object.defineProperty(exports, "get", {
    enumerable: !0,
    get: function() {
        return vutils_1.get;
    }
}), Object.defineProperty(exports, "pick", {
    enumerable: !0,
    get: function() {
        return vutils_1.pick;
    }
}), Object.defineProperty(exports, "cloneDeep", {
    enumerable: !0,
    get: function() {
        return vutils_1.cloneDeep;
    }
}), exports.field = field;
//# sourceMappingURL=object.js.map
