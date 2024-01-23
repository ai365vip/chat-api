"use strict";

function getUpgradedTokenValue(palette, key) {
    const legacyKey = exports.newTokenToLegacyToken[key];
    if (legacyKey && palette[legacyKey]) return palette[legacyKey];
    if (palette[key]) return palette[key];
    const newKey = exports.legacyTokenToNewToken[key];
    return newKey ? palette[newKey] : void 0;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getUpgradedTokenValue = exports.legacyTokenToNewToken = exports.newTokenToLegacyToken = void 0, 
exports.newTokenToLegacyToken = {
    primaryFontColor: "titleFontColor",
    tertiaryFontColor: "labelFontColor",
    axisLabelFontColor: "axisFontColor",
    axisMarkerFontColor: "labelReverseFontColor",
    dataZoomHandleStrokeColor: "dataZoomHandlerStrokeColor",
    sliderHandleColor: "dataZoomHandlerFillColor",
    sliderRailColor: "dataZoomBackgroundColor",
    sliderTrackColor: "dataZoomSelectedColor",
    playerControllerColor: "dataZoomSelectedColor",
    popupBackgroundColor: "tooltipBackgroundColor",
    hoverBackgroundColor: "axisGridColor"
}, exports.legacyTokenToNewToken = {
    titleFontColor: "primaryFontColor",
    labelFontColor: "tertiaryFontColor",
    axisFontColor: "axisLabelFontColor",
    labelReverseFontColor: "axisMarkerFontColor",
    dataZoomHandlerStrokeColor: "dataZoomHandleStrokeColor",
    dataZoomHandlerFillColor: "sliderHandleColor",
    dataZoomBackgroundColor: "sliderRailColor",
    dataZoomSelectedColor: "sliderTrackColor",
    tooltipBackgroundColor: "popupBackgroundColor"
}, exports.getUpgradedTokenValue = getUpgradedTokenValue;
//# sourceMappingURL=legacy.js.map
