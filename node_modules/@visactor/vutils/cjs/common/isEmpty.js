"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNil_1 = __importDefault(require("./isNil")), isArrayLike_1 = __importDefault(require("./isArrayLike")), getType_1 = __importDefault(require("./getType")), isPrototype_1 = __importDefault(require("./isPrototype")), hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(value) {
    if ((0, isNil_1.default)(value)) return !0;
    if ((0, isArrayLike_1.default)(value)) return !value.length;
    const type = (0, getType_1.default)(value);
    if ("Map" === type || "Set" === type) return !value.size;
    if ((0, isPrototype_1.default)(value)) return !Object.keys(value).length;
    for (const key in value) if (hasOwnProperty.call(value, key)) return !1;
    return !0;
}

exports.default = isEmpty;
//# sourceMappingURL=isEmpty.js.map