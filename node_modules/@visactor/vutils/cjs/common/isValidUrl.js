"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isValidUrl = void 0;

const isValidUrl = value => new RegExp(/^(http(s)?:\/\/)\w+[^\s]+(\.[^\s]+){1,}$/).test(value);

exports.isValidUrl = isValidUrl, exports.default = exports.isValidUrl;
//# sourceMappingURL=isValidUrl.js.map
