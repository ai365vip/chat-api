"use strict";

var UpdateTag, IContainPointMode, AttributeUpdateType, AnimateStatus, AnimateMode, AnimateStepType, Direction, CurveTypeEnum, BaseRenderContributionTime;

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BaseRenderContributionTime = exports.CurveTypeEnum = exports.Direction = exports.AnimateStepType = exports.AnimateMode = exports.AnimateStatus = exports.AttributeUpdateType = exports.IContainPointMode = exports.UpdateTag = void 0, 
function(UpdateTag) {
    UpdateTag[UpdateTag.NONE = 0] = "NONE", UpdateTag[UpdateTag.UPDATE_BOUNDS = 1] = "UPDATE_BOUNDS", 
    UpdateTag[UpdateTag.UPDATE_SHAPE = 2] = "UPDATE_SHAPE", UpdateTag[UpdateTag.CLEAR_SHAPE = 253] = "CLEAR_SHAPE", 
    UpdateTag[UpdateTag.UPDATE_SHAPE_AND_BOUNDS = 3] = "UPDATE_SHAPE_AND_BOUNDS", UpdateTag[UpdateTag.INIT = 179] = "INIT", 
    UpdateTag[UpdateTag.CLEAR_BOUNDS = 254] = "CLEAR_BOUNDS", UpdateTag[UpdateTag.UPDATE_GLOBAL_MATRIX = 32] = "UPDATE_GLOBAL_MATRIX", 
    UpdateTag[UpdateTag.CLEAR_GLOBAL_MATRIX = 223] = "CLEAR_GLOBAL_MATRIX", UpdateTag[UpdateTag.UPDATE_LOCAL_MATRIX = 16] = "UPDATE_LOCAL_MATRIX", 
    UpdateTag[UpdateTag.CLEAR_LOCAL_MATRIX = 239] = "CLEAR_LOCAL_MATRIX", UpdateTag[UpdateTag.UPDATE_GLOBAL_LOCAL_MATRIX = 48] = "UPDATE_GLOBAL_LOCAL_MATRIX", 
    UpdateTag[UpdateTag.UPDATE_LAYOUT = 128] = "UPDATE_LAYOUT", UpdateTag[UpdateTag.CLEAR_LAYOUT = 127] = "CLEAR_LAYOUT";
}(UpdateTag = exports.UpdateTag || (exports.UpdateTag = {})), function(IContainPointMode) {
    IContainPointMode[IContainPointMode.GLOBAL = 1] = "GLOBAL", IContainPointMode[IContainPointMode.LOCAL = 16] = "LOCAL", 
    IContainPointMode[IContainPointMode.GLOBAL_ACCURATE = 3] = "GLOBAL_ACCURATE", IContainPointMode[IContainPointMode.LOCAL_ACCURATE = 48] = "LOCAL_ACCURATE";
}(IContainPointMode = exports.IContainPointMode || (exports.IContainPointMode = {})), 
function(AttributeUpdateType) {
    AttributeUpdateType[AttributeUpdateType.INIT = 0] = "INIT", AttributeUpdateType[AttributeUpdateType.DEFAULT = 1] = "DEFAULT", 
    AttributeUpdateType[AttributeUpdateType.STATE = 2] = "STATE", AttributeUpdateType[AttributeUpdateType.ANIMATE_BIND = 10] = "ANIMATE_BIND", 
    AttributeUpdateType[AttributeUpdateType.ANIMATE_PLAY = 11] = "ANIMATE_PLAY", AttributeUpdateType[AttributeUpdateType.ANIMATE_START = 12] = "ANIMATE_START", 
    AttributeUpdateType[AttributeUpdateType.ANIMATE_UPDATE = 13] = "ANIMATE_UPDATE", 
    AttributeUpdateType[AttributeUpdateType.ANIMATE_END = 14] = "ANIMATE_END", AttributeUpdateType[AttributeUpdateType.TRANSLATE = 20] = "TRANSLATE", 
    AttributeUpdateType[AttributeUpdateType.TRANSLATE_TO = 21] = "TRANSLATE_TO", AttributeUpdateType[AttributeUpdateType.SCALE = 22] = "SCALE", 
    AttributeUpdateType[AttributeUpdateType.SCALE_TO = 23] = "SCALE_TO", AttributeUpdateType[AttributeUpdateType.ROTATE = 24] = "ROTATE", 
    AttributeUpdateType[AttributeUpdateType.ROTATE_TO = 25] = "ROTATE_TO";
}(AttributeUpdateType = exports.AttributeUpdateType || (exports.AttributeUpdateType = {})), 
function(AnimateStatus) {
    AnimateStatus[AnimateStatus.INITIAL = 0] = "INITIAL", AnimateStatus[AnimateStatus.RUNNING = 1] = "RUNNING", 
    AnimateStatus[AnimateStatus.PAUSED = 2] = "PAUSED", AnimateStatus[AnimateStatus.END = 3] = "END";
}(AnimateStatus = exports.AnimateStatus || (exports.AnimateStatus = {})), function(AnimateMode) {
    AnimateMode[AnimateMode.NORMAL = 0] = "NORMAL", AnimateMode[AnimateMode.SET_ATTR_IMMEDIATELY = 1] = "SET_ATTR_IMMEDIATELY";
}(AnimateMode = exports.AnimateMode || (exports.AnimateMode = {})), function(AnimateStepType) {
    AnimateStepType.wait = "wait", AnimateStepType.from = "from", AnimateStepType.to = "to", 
    AnimateStepType.customAnimate = "customAnimate";
}(AnimateStepType = exports.AnimateStepType || (exports.AnimateStepType = {})), 
function(Direction) {
    Direction[Direction.ROW = 1] = "ROW", Direction[Direction.COLUMN = 2] = "COLUMN";
}(Direction = exports.Direction || (exports.Direction = {})), function(CurveTypeEnum) {
    CurveTypeEnum[CurveTypeEnum.CubicBezierCurve = 0] = "CubicBezierCurve", CurveTypeEnum[CurveTypeEnum.QuadraticBezierCurve = 1] = "QuadraticBezierCurve", 
    CurveTypeEnum[CurveTypeEnum.ArcCurve = 2] = "ArcCurve", CurveTypeEnum[CurveTypeEnum.LineCurve = 3] = "LineCurve", 
    CurveTypeEnum[CurveTypeEnum.EllipseCurve = 4] = "EllipseCurve", CurveTypeEnum[CurveTypeEnum.MoveCurve = 5] = "MoveCurve";
}(CurveTypeEnum = exports.CurveTypeEnum || (exports.CurveTypeEnum = {})), function(BaseRenderContributionTime) {
    BaseRenderContributionTime[BaseRenderContributionTime.beforeFillStroke = 0] = "beforeFillStroke", 
    BaseRenderContributionTime[BaseRenderContributionTime.afterFillStroke = 1] = "afterFillStroke";
}(BaseRenderContributionTime = exports.BaseRenderContributionTime || (exports.BaseRenderContributionTime = {}));
//# sourceMappingURL=enums.js.map