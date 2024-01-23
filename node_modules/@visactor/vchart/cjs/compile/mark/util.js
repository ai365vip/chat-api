"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.stateToReverse = exports.stateInDefaultEnum = exports.isStateAttrChangeable = exports.isAttrChangeable = void 0;

const vutils_1 = require("@visactor/vutils"), interface_1 = require("./interface");

function isAttrChangeable(key, stateStyle) {
    var _a;
    for (const state in stateStyle) if (state !== interface_1.STATE_VALUE_ENUM.STATE_NORMAL) {
        if (key in stateStyle[state]) return !0;
    } else {
        const style = null === (_a = stateStyle[state][key]) || void 0 === _a ? void 0 : _a.style;
        if (isGradientAttribute(key, style)) return !0;
        if ((0, vutils_1.isFunction)(style)) return !0;
        if (!!(null == style ? void 0 : style.scale)) return !0;
    }
    return !1;
}

function isStateAttrChangeable(key, stateStyle, facetField) {
    var _a;
    const style = null === (_a = stateStyle[key]) || void 0 === _a ? void 0 : _a.style;
    if (isGradientAttribute(key, style)) return !0;
    if ((0, vutils_1.isFunction)(style)) return !0;
    return !(!(null == style ? void 0 : style.scale) || style.field === facetField);
}

function isGradientAttribute(key, style) {
    return ("fill" === key || "stroke" === key) && (null == style ? void 0 : style.gradient) && (null == style ? void 0 : style.stops);
}

exports.isAttrChangeable = isAttrChangeable, exports.isStateAttrChangeable = isStateAttrChangeable;

const DEFAULT_STATE_VALUE_ENUM = {};

function stateInDefaultEnum(state) {
    return !!DEFAULT_STATE_VALUE_ENUM[state];
}

Object.values(interface_1.STATE_VALUE_ENUM).forEach((v => {
    DEFAULT_STATE_VALUE_ENUM[v] = !0;
})), exports.stateInDefaultEnum = stateInDefaultEnum;

const DEFAULT_STATE_VALUE_TO_REVERSE = {
    [interface_1.STATE_VALUE_ENUM.STATE_HOVER]: interface_1.STATE_VALUE_ENUM.STATE_HOVER_REVERSE,
    [interface_1.STATE_VALUE_ENUM.STATE_SELECTED]: interface_1.STATE_VALUE_ENUM.STATE_SELECTED_REVERSE,
    [interface_1.STATE_VALUE_ENUM.STATE_DIMENSION_HOVER]: interface_1.STATE_VALUE_ENUM.STATE_DIMENSION_HOVER_REVERSE
};

function stateToReverse(state) {
    return DEFAULT_STATE_VALUE_TO_REVERSE[state];
}

exports.stateToReverse = stateToReverse;
//# sourceMappingURL=util.js.map
