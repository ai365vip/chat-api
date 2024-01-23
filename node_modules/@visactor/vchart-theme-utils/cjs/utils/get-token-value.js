"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getTokenValue = void 0;

const getTokenValue = (token, defaultValue, chartContainer) => {
    const value = token && getComputedStyle(null != chartContainer ? chartContainer : document.body).getPropertyValue(token) || defaultValue;
    return value && !isNaN(value[0]) ? `rgba(${value})` : value;
};

exports.getTokenValue = getTokenValue;
//# sourceMappingURL=get-token-value.js.map