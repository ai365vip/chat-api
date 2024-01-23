export var ScaleEnum;

!function(ScaleEnum) {
    ScaleEnum.Identity = "identity", ScaleEnum.Linear = "linear", ScaleEnum.Log = "log", 
    ScaleEnum.Pow = "pow", ScaleEnum.Sqrt = "sqrt", ScaleEnum.Symlog = "symlog", ScaleEnum.Time = "time", 
    ScaleEnum.Quantile = "quantile", ScaleEnum.Quantize = "quantize", ScaleEnum.Threshold = "threshold", 
    ScaleEnum.Ordinal = "ordinal", ScaleEnum.Point = "point", ScaleEnum.Band = "band";
}(ScaleEnum || (ScaleEnum = {}));

const EnableScaleMap = {};

Object.values(ScaleEnum).forEach((v => {
    EnableScaleMap[v] = !0;
}));

export function isContinuous(type) {
    switch (type) {
      case ScaleEnum.Linear:
      case ScaleEnum.Log:
      case ScaleEnum.Pow:
      case ScaleEnum.Sqrt:
      case ScaleEnum.Symlog:
      case ScaleEnum.Time:
        return !0;

      default:
        return !1;
    }
}

export function isValidScaleType(type) {
    return !!EnableScaleMap[type];
}

export function isDiscrete(type) {
    switch (type) {
      case ScaleEnum.Ordinal:
      case ScaleEnum.Point:
      case ScaleEnum.Band:
        return !0;

      default:
        return !1;
    }
}

export function isDiscretizing(type) {
    switch (type) {
      case ScaleEnum.Quantile:
      case ScaleEnum.Quantize:
      case ScaleEnum.Threshold:
        return !0;

      default:
        return !1;
    }
}

export function supportRangeFactor(type) {
    switch (type) {
      case ScaleEnum.Linear:
      case ScaleEnum.Log:
      case ScaleEnum.Pow:
      case ScaleEnum.Sqrt:
      case ScaleEnum.Symlog:
      case ScaleEnum.Time:
      case ScaleEnum.Band:
      case ScaleEnum.Point:
        return !0;

      default:
        return !1;
    }
}
//# sourceMappingURL=type.js.map