"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const vgrammar_util_1 = require("@visactor/vgrammar-util"), vutils_1 = require("@visactor/vutils"), projections_1 = require("./projections");

function initPath(path, pointRadius) {
    const prev = path.pointRadius();
    return path.context(null), (0, vutils_1.isNil)(pointRadius) || path.pointRadius(pointRadius), 
    prev;
}

const transform = (options, upstreamData) => {
    const field = (0, vutils_1.isNil)(options.field) ? vgrammar_util_1.identity : (0, 
    vgrammar_util_1.field)(options.field), as = options.as, path = (0, projections_1.getProjectionPath)(options.projection), prev = initPath(path, options.pointRadius);
    let output = upstreamData;
    return (0, vutils_1.isNil)(as) ? output = upstreamData.map((entry => path(field(entry)))) : upstreamData.forEach((entry => {
        entry[as] = path(field(entry));
    })), path.pointRadius(prev), output;
};

exports.transform = transform;