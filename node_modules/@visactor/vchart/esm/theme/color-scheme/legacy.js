export const newTokenToLegacyToken = {
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
};

export const legacyTokenToNewToken = {
    titleFontColor: "primaryFontColor",
    labelFontColor: "tertiaryFontColor",
    axisFontColor: "axisLabelFontColor",
    labelReverseFontColor: "axisMarkerFontColor",
    dataZoomHandlerStrokeColor: "dataZoomHandleStrokeColor",
    dataZoomHandlerFillColor: "sliderHandleColor",
    dataZoomBackgroundColor: "sliderRailColor",
    dataZoomSelectedColor: "sliderTrackColor",
    tooltipBackgroundColor: "popupBackgroundColor"
};

export function getUpgradedTokenValue(palette, key) {
    const legacyKey = newTokenToLegacyToken[key];
    if (legacyKey && palette[legacyKey]) return palette[legacyKey];
    if (palette[key]) return palette[key];
    const newKey = legacyTokenToNewToken[key];
    return newKey ? palette[newKey] : void 0;
}
//# sourceMappingURL=legacy.js.map
