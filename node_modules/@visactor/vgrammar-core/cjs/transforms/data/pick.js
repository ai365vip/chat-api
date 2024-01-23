"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vgrammar_util_1 = require("@visactor/vgrammar-util"), vutils_1 = require("@visactor/vutils"), util_1 = require("../util/util");

function project(source, fields, as) {
    return fields.reduce(((res, field, index) => (res[as[index]] = field(source), res)), {});
}

const transform = (options, upstreamData) => {
    const {fields: fields = []} = options, as = (0, util_1.fieldNames)(fields, options.as || []), fieldsAccessors = fields.map((field => (0, 
    vutils_1.isString)(field) ? (0, vgrammar_util_1.field)(field) : field));
    return fieldsAccessors.length ? upstreamData.map(((entry, index) => project(entry, fieldsAccessors, as))) : upstreamData.map(((entry, index) => ({})));
};

exports.transform = transform;
//# sourceMappingURL=pick.js.map
