export declare enum ScaleEnum {
    Identity = "identity",
    Linear = "linear",
    Log = "log",
    Pow = "pow",
    Sqrt = "sqrt",
    Symlog = "symlog",
    Time = "time",
    Quantile = "quantile",
    Quantize = "quantize",
    Threshold = "threshold",
    Ordinal = "ordinal",
    Point = "point",
    Band = "band"
}
export declare function isContinuous(type: string): boolean;
export declare function isValidScaleType(type: string): boolean;
export declare function isDiscrete(type: string): boolean;
export declare function isDiscretizing(type: string): boolean;
export declare function supportRangeFactor(type: string): boolean;
