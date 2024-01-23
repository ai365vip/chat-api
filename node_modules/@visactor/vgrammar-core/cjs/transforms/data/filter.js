"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transform = void 0;

const transform = (options, data, parameters) => data.filter((entry => options.callback(entry, parameters)));

exports.transform = transform;
//# sourceMappingURL=filter.js.map
