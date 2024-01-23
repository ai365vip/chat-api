"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getColorSchemeBySeries = exports.transformColorSchemeToStandardStruct = exports.isProgressiveDataColorScheme = exports.isColorKey = exports.getActualColor = exports.queryColorFromColorScheme = exports.computeActualDataScheme = exports.getDataScheme = void 0;

const vutils_1 = require("@visactor/vutils"), spec_1 = require("../../series/util/spec"), legacy_1 = require("./legacy");

function getDataScheme(colorScheme, seriesSpec) {
    var _a;
    if (!colorScheme) return [];
    const scheme = getColorSchemeBySeries(colorScheme, seriesSpec);
    if (!scheme || (0, vutils_1.isArray)(scheme)) return null !== (_a = scheme) && void 0 !== _a ? _a : [];
    if ((0, vutils_1.isObject)(scheme)) {
        const {dataScheme: dataScheme} = scheme;
        return dataScheme ? isProgressiveDataColorScheme(dataScheme) ? dataScheme.map((item => Object.assign(Object.assign({}, item), {
            scheme: item.scheme.map((color => isColorKey(color) ? queryColorFromColorScheme(colorScheme, color, seriesSpec) : color)).filter(vutils_1.isValid)
        }))) : dataScheme.map((color => isColorKey(color) ? queryColorFromColorScheme(colorScheme, color, seriesSpec) : color)).filter(vutils_1.isValid) : [];
    }
    return [];
}

function computeActualDataScheme(dataScheme, colorDomain) {
    var _a, _b;
    return isProgressiveDataColorScheme(dataScheme) ? null !== (_b = null === (_a = dataScheme.find((item => (0, 
    vutils_1.isValid)(item.isAvailable) ? (0, vutils_1.isFunction)(item.isAvailable) ? item.isAvailable(colorDomain) : !!item.isAvailable : !(0, 
    vutils_1.isValid)(item.maxDomainLength) || (null == colorDomain ? void 0 : colorDomain.length) <= item.maxDomainLength))) || void 0 === _a ? void 0 : _a.scheme) && void 0 !== _b ? _b : dataScheme[dataScheme.length - 1].scheme : dataScheme;
}

function queryColorFromColorScheme(colorScheme, colorKey, seriesSpec) {
    var _a;
    const scheme = getColorSchemeBySeries(colorScheme, seriesSpec);
    if (!scheme) return;
    let color;
    const {palette: palette} = scheme;
    if ((0, vutils_1.isObject)(palette) && (color = null !== (_a = (0, legacy_1.getUpgradedTokenValue)(palette, colorKey.key)) && void 0 !== _a ? _a : colorKey.default), 
    !color) return;
    if ((0, vutils_1.isNil)(colorKey.a) && (0, vutils_1.isNil)(colorKey.l) || !(0, vutils_1.isString)(color)) return color;
    let c = new vutils_1.Color(color);
    if ((0, vutils_1.isValid)(colorKey.l)) {
        const {r: r, g: g, b: b} = c.color, {h: h, s: s} = (0, vutils_1.rgbToHsl)(r, g, b), rgb = (0, 
        vutils_1.hslToRgb)(h, s, colorKey.l), newColor = new vutils_1.Color(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        newColor.setOpacity(c.color.opacity), c = newColor;
    }
    return (0, vutils_1.isValid)(colorKey.a) && c.setOpacity(colorKey.a), c.toRGBA();
}

exports.getDataScheme = getDataScheme, exports.computeActualDataScheme = computeActualDataScheme, 
exports.queryColorFromColorScheme = queryColorFromColorScheme;

const getActualColor = (value, colorScheme, seriesSpec) => {
    if (colorScheme && isColorKey(value)) {
        const color = queryColorFromColorScheme(colorScheme, value, seriesSpec);
        if (color) return color;
    }
    return value;
};

function isColorKey(obj) {
    return obj && "palette" === obj.type && !!obj.key;
}

function isProgressiveDataColorScheme(obj) {
    return !(!(0, vutils_1.isArray)(obj) || 0 === obj.length) && obj.every((item => (0, 
    vutils_1.isValid)(item.scheme)));
}

function transformColorSchemeToStandardStruct(colorScheme) {
    return (0, vutils_1.isArray)(colorScheme) ? {
        dataScheme: colorScheme
    } : colorScheme;
}

function getColorSchemeBySeries(colorScheme, seriesSpec) {
    var _a, _b;
    const {type: seriesType} = null != seriesSpec ? seriesSpec : {};
    let scheme;
    if (!seriesSpec || (0, vutils_1.isNil)(seriesType)) scheme = null == colorScheme ? void 0 : colorScheme.default; else {
        const direction = (0, spec_1.getDirectionFromSeriesSpec)(seriesSpec);
        scheme = null !== (_b = null !== (_a = null == colorScheme ? void 0 : colorScheme[`${seriesType}_${direction}`]) && void 0 !== _a ? _a : null == colorScheme ? void 0 : colorScheme[seriesType]) && void 0 !== _b ? _b : null == colorScheme ? void 0 : colorScheme.default;
    }
    return scheme;
}

exports.getActualColor = getActualColor, exports.isColorKey = isColorKey, exports.isProgressiveDataColorScheme = isProgressiveDataColorScheme, 
exports.transformColorSchemeToStandardStruct = transformColorSchemeToStandardStruct, 
exports.getColorSchemeBySeries = getColorSchemeBySeries;
//# sourceMappingURL=util.js.map
