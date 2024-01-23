export declare enum UpdateTag {
    NONE = 0,
    UPDATE_BOUNDS = 1,
    UPDATE_SHAPE = 2,
    CLEAR_SHAPE = 253,
    UPDATE_SHAPE_AND_BOUNDS = 3,
    INIT = 179,
    CLEAR_BOUNDS = 254,
    UPDATE_GLOBAL_MATRIX = 32,
    CLEAR_GLOBAL_MATRIX = 223,
    UPDATE_LOCAL_MATRIX = 16,
    CLEAR_LOCAL_MATRIX = 239,
    UPDATE_GLOBAL_LOCAL_MATRIX = 48,
    UPDATE_LAYOUT = 128,
    CLEAR_LAYOUT = 127
}
export declare enum IContainPointMode {
    GLOBAL = 1,
    LOCAL = 16,
    GLOBAL_ACCURATE = 3,
    LOCAL_ACCURATE = 48
}
export declare enum AttributeUpdateType {
    INIT = 0,
    DEFAULT = 1,
    STATE = 2,
    ANIMATE_BIND = 10,
    ANIMATE_PLAY = 11,
    ANIMATE_START = 12,
    ANIMATE_UPDATE = 13,
    ANIMATE_END = 14,
    TRANSLATE = 20,
    TRANSLATE_TO = 21,
    SCALE = 22,
    SCALE_TO = 23,
    ROTATE = 24,
    ROTATE_TO = 25
}
export declare enum AnimateStatus {
    INITIAL = 0,
    RUNNING = 1,
    PAUSED = 2,
    END = 3
}
export declare enum AnimateMode {
    NORMAL = 0,
    SET_ATTR_IMMEDIATELY = 1
}
export declare enum AnimateStepType {
    'wait' = "wait",
    'from' = "from",
    'to' = "to",
    'customAnimate' = "customAnimate"
}
export declare enum Direction {
    ROW = 1,
    COLUMN = 2
}
export declare enum CurveTypeEnum {
    CubicBezierCurve = 0,
    QuadraticBezierCurve = 1,
    ArcCurve = 2,
    LineCurve = 3,
    EllipseCurve = 4,
    MoveCurve = 5
}
export declare enum BaseRenderContributionTime {
    beforeFillStroke = 0,
    afterFillStroke = 1
}
