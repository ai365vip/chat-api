export const sunburstPresetAnimation = (_params, preset) => {
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
//# sourceMappingURL=preset.js.map
