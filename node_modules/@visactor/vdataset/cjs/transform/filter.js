"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.filter = void 0;

const filter = (data, options) => {
    const {callback: callback} = options;
    return callback && (data = data.filter(callback)), data;
};

exports.filter = filter;
//# sourceMappingURL=filter.js.map