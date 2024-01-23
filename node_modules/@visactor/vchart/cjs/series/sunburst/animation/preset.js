"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.sunburstPresetAnimation = void 0;

const sunburstPresetAnimation = (_params, preset) => {
    switch (preset) {
      case "fadeIn":
        return {
            type: "fadeIn"
        };

      case "growAngle":
        return {
            type: "growAngleIn"
        };

      default:
        return {
            type: "growRadiusIn"
        };
    }
};

exports.sunburstPresetAnimation = sunburstPresetAnimation;
//# sourceMappingURL=preset.js.map
