import { isFunction } from "@visactor/vutils";

import { STATE_VALUE_ENUM } from "./interface";

export function isAttrChangeable(key, stateStyle) {
    var _a;
    for (const state in stateStyle) if (state !== STATE_VALUE_ENUM.STATE_NORMAL) {
        if (key in stateStyle[state]) return !0;
    } else {
        const style = null === (_a = stateStyle[state][key]) || void 0 === _a ? void 0 : _a.style;
        if (isGradientAttribute(key, style)) return !0;
        if (isFunction(style)) return !0;
        if (!!(null == style ? void 0 : style.scale)) return !0;
    }
    return !1;
}

export function isStateAttrChangeable(key, stateStyle, facetField) {
    var _a;
    const style = null === (_a = stateStyle[key]) || void 0 === _a ? void 0 : _a.style;
    if (isGradientAttribute(key, style)) return !0;
    if (isFunction(style)) return !0;
    return !(!(null == style ? void 0 : style.scale) || style.field === facetField);
}

function isGradientAttribute(key, style) {
    return ("fill" === key || "stroke" === key) && (null == style ? void 0 : style.gradient) && (null == style ? void 0 : style.stops);
}

const DEFAULT_STATE_VALUE_ENUM = {};

Object.values(STATE_VALUE_ENUM).forEach((v => {
    DEFAULT_STATE_VALUE_ENUM[v] = !0;
}));

export function stateInDefaultEnum(state) {
    return !!DEFAULT_STATE_VALUE_ENUM[state];
}

const DEFAULT_STATE_VALUE_TO_REVERSE = {
    [STATE_VALUE_ENUM.STATE_HOVER]: STATE_VALUE_ENUM.STATE_HOVER_REVERSE,
    [STATE_VALUE_ENUM.STATE_SELECTED]: STATE_VALUE_ENUM.STATE_SELECTED_REVERSE,
    [STATE_VALUE_ENUM.STATE_DIMENSION_HOVER]: STATE_VALUE_ENUM.STATE_DIMENSION_HOVER_REVERSE
};

export function stateToReverse(state) {
    return DEFAULT_STATE_VALUE_TO_REVERSE[state];
}
//# sourceMappingURL=util.js.map
