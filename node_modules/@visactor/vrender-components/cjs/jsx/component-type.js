"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.VTag = void 0;

const tag_1 = require("../tag");

function VTag(params) {
    return new tag_1.Tag(params ? params.attribute : {});
}

exports.VTag = VTag;
//# sourceMappingURL=component-type.js.map