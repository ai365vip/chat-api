"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.parseEncodeType = exports.isFieldEncode = exports.isScaleEncode = void 0;

const vutils_1 = require("@visactor/vutils"), util_1 = require("./util");

function isScaleEncode(encode) {
    return !!(null == encode ? void 0 : encode.scale);
}

function isFieldEncode(encode) {
    return !!(null == encode ? void 0 : encode.field);
}

function parseEncodeType(encoder, view) {
    if (!encoder) return [];
    let dependencies = [];
    return encoder.scale && (dependencies = (0, util_1.isGrammar)(encoder.scale) ? [ encoder.scale ] : (0, 
    vutils_1.array)(view.getScaleById(encoder.scale))), dependencies.concat((0, util_1.parseFunctionType)(encoder, view));
}

exports.isScaleEncode = isScaleEncode, exports.isFieldEncode = isFieldEncode, exports.parseEncodeType = parseEncodeType;
//# sourceMappingURL=mark.js.map
