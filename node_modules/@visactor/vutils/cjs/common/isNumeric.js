"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNumeric = value => "string" == typeof value && (!isNaN(Number(value)) && !isNaN(parseFloat(value)));

exports.default = isNumeric;
//# sourceMappingURL=isNumeric.js.map