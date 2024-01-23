"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.accessorFields = exports.accessorName = exports.accessor = void 0;

const vutils_1 = require("@visactor/vutils"), accessor = (fn, fields, name) => (fn.fields = fields || [], 
fn.fname = name, fn);

function accessorName(fn) {
    return (0, vutils_1.isNil)(fn) ? null : fn.fname;
}

function accessorFields(fn) {
    return (0, vutils_1.isNil)(fn) ? null : fn.fields;
}

exports.accessor = accessor, exports.accessorName = accessorName, exports.accessorFields = accessorFields;