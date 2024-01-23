import { Color, hexToRgb } from "@visactor/vutils";

const defaultAlternativeColors = [ "#ffffff", "#000000" ];

export function labelSmartInvert(foregroundColorOrigin, backgroundColorOrogin, textType, contrastRatiosThreshold, alternativeColors, mode) {
    if ("string" != typeof foregroundColorOrigin || "string" != typeof backgroundColorOrogin) return foregroundColorOrigin;
    const foregroundColor = new Color(foregroundColorOrigin).toHex(), backgroundColor = new Color(backgroundColorOrogin).toHex();
    return contrastAccessibilityChecker(foregroundColor, backgroundColor, textType, contrastRatiosThreshold, mode) ? foregroundColor : improveContrastReverse(foregroundColor, backgroundColor, textType, contrastRatiosThreshold, alternativeColors, mode);
}

function improveContrastReverse(foregroundColor, backgroundColor, textType, contrastRatiosThreshold, alternativeColors, mode) {
    const alternativeColorPalletes = [];
    alternativeColors && (alternativeColors instanceof Array ? alternativeColorPalletes.push(...alternativeColors) : alternativeColorPalletes.push(alternativeColors)), 
    alternativeColorPalletes.push(...defaultAlternativeColors);
    for (const alternativeColor of alternativeColorPalletes) if (foregroundColor !== alternativeColor && contrastAccessibilityChecker(alternativeColor, backgroundColor, textType, contrastRatiosThreshold, mode)) return alternativeColor;
}

export function contrastAccessibilityChecker(foregroundColor, backgroundColor, textType, contrastRatiosThreshold, mode) {
    if ("lightness" === mode) {
        const backgroundColorLightness = Color.getColorBrightness(new Color(backgroundColor));
        return Color.getColorBrightness(new Color(foregroundColor)) < .5 ? backgroundColorLightness >= .5 : backgroundColorLightness < .5;
    }
    return contrastRatiosThreshold ? contrastRatios(foregroundColor, backgroundColor) > contrastRatiosThreshold : "largeText" === textType ? contrastRatios(foregroundColor, backgroundColor) > 3 : contrastRatios(foregroundColor, backgroundColor) > 4.5;
}

function contrastRatios(foregroundColor, backgroundColor) {
    const foregroundColorLuminance = getColorLuminance(foregroundColor), backgroundColorLuminance = getColorLuminance(backgroundColor);
    return ((foregroundColorLuminance > backgroundColorLuminance ? foregroundColorLuminance : backgroundColorLuminance) + .05) / ((foregroundColorLuminance > backgroundColorLuminance ? backgroundColorLuminance : foregroundColorLuminance) + .05);
}

function getColorLuminance(color) {
    const rgb8bit = hexToRgb(color), RsRGB = rgb8bit[0] / 255, GsRGB = rgb8bit[1] / 255, BsRGB = rgb8bit[2] / 255;
    let R, G, B;
    R = RsRGB <= .03928 ? RsRGB / 12.92 : Math.pow((RsRGB + .055) / 1.055, 2.4), G = GsRGB <= .03928 ? GsRGB / 12.92 : Math.pow((GsRGB + .055) / 1.055, 2.4), 
    B = BsRGB <= .03928 ? BsRGB / 12.92 : Math.pow((BsRGB + .055) / 1.055, 2.4);
    return .2126 * R + .7152 * G + .0722 * B;
}

export function smartInvertStrategy(fillStrategy, baseColor, invertColor, similarColor) {
    let result;
    switch (fillStrategy) {
      case "base":
        result = baseColor;
        break;

      case "invertBase":
        result = invertColor;
        break;

      case "similarBase":
        result = similarColor;
    }
    return result;
}
//# sourceMappingURL=label-smartInvert.js.map
