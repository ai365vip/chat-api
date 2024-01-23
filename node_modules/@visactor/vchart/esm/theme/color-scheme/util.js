import { isArray, isFunction, isObject, isString, isValid, Color, isNil, rgbToHsl, hslToRgb } from "@visactor/vutils";

import { getDirectionFromSeriesSpec } from "../../series/util/spec";

import { getUpgradedTokenValue } from "./legacy";

export function getDataScheme(colorScheme, seriesSpec) {
    var _a;
    if (!colorScheme) return [];
    const scheme = getColorSchemeBySeries(colorScheme, seriesSpec);
    if (!scheme || isArray(scheme)) return null !== (_a = scheme) && void 0 !== _a ? _a : [];
    if (isObject(scheme)) {
        const {dataScheme: dataScheme} = scheme;
        return dataScheme ? isProgressiveDataColorScheme(dataScheme) ? dataScheme.map((item => Object.assign(Object.assign({}, item), {
            scheme: item.scheme.map((color => isColorKey(color) ? queryColorFromColorScheme(colorScheme, color, seriesSpec) : color)).filter(isValid)
        }))) : dataScheme.map((color => isColorKey(color) ? queryColorFromColorScheme(colorScheme, color, seriesSpec) : color)).filter(isValid) : [];
    }
    return [];
}

export function computeActualDataScheme(dataScheme, colorDomain) {
    var _a, _b;
    return isProgressiveDataColorScheme(dataScheme) ? null !== (_b = null === (_a = dataScheme.find((item => isValid(item.isAvailable) ? isFunction(item.isAvailable) ? item.isAvailable(colorDomain) : !!item.isAvailable : !isValid(item.maxDomainLength) || (null == colorDomain ? void 0 : colorDomain.length) <= item.maxDomainLength))) || void 0 === _a ? void 0 : _a.scheme) && void 0 !== _b ? _b : dataScheme[dataScheme.length - 1].scheme : dataScheme;
}

export function queryColorFromColorScheme(colorScheme, colorKey, seriesSpec) {
    var _a;
    const scheme = getColorSchemeBySeries(colorScheme, seriesSpec);
    if (!scheme) return;
    let color;
    const {palette: palette} = scheme;
    if (isObject(palette) && (color = null !== (_a = getUpgradedTokenValue(palette, colorKey.key)) && void 0 !== _a ? _a : colorKey.default), 
    !color) return;
    if (isNil(colorKey.a) && isNil(colorKey.l) || !isString(color)) return color;
    let c = new Color(color);
    if (isValid(colorKey.l)) {
        const {r: r, g: g, b: b} = c.color, {h: h, s: s} = rgbToHsl(r, g, b), rgb = hslToRgb(h, s, colorKey.l), newColor = new Color(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        newColor.setOpacity(c.color.opacity), c = newColor;
    }
    return isValid(colorKey.a) && c.setOpacity(colorKey.a), c.toRGBA();
}

export const getActualColor = (value, colorScheme, seriesSpec) => {
    if (colorScheme && isColorKey(value)) {
        const color = queryColorFromColorScheme(colorScheme, value, seriesSpec);
        if (color) return color;
    }
    return value;
};

export function isColorKey(obj) {
    return obj && "palette" === obj.type && !!obj.key;
}

export function isProgressiveDataColorScheme(obj) {
    return !(!isArray(obj) || 0 === obj.length) && obj.every((item => isValid(item.scheme)));
}

export function transformColorSchemeToStandardStruct(colorScheme) {
    return isArray(colorScheme) ? {
        dataScheme: colorScheme
    } : colorScheme;
}

export function getColorSchemeBySeries(colorScheme, seriesSpec) {
    var _a, _b;
    const {type: seriesType} = null != seriesSpec ? seriesSpec : {};
    let scheme;
    if (!seriesSpec || isNil(seriesType)) scheme = null == colorScheme ? void 0 : colorScheme.default; else {
        const direction = getDirectionFromSeriesSpec(seriesSpec);
        scheme = null !== (_b = null !== (_a = null == colorScheme ? void 0 : colorScheme[`${seriesType}_${direction}`]) && void 0 !== _a ? _a : null == colorScheme ? void 0 : colorScheme[seriesType]) && void 0 !== _b ? _b : null == colorScheme ? void 0 : colorScheme.default;
    }
    return scheme;
}
//# sourceMappingURL=util.js.map
