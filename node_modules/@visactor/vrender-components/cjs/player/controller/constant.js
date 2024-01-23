"use strict";

var ControllerEventEnum, ControllerTypeEnum;

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ControllerTypeEnum = exports.ControllerEventEnum = void 0, function(ControllerEventEnum) {
    ControllerEventEnum.OnPlay = "onPlay", ControllerEventEnum.OnPause = "onPause", 
    ControllerEventEnum.OnForward = "onForward", ControllerEventEnum.OnBackward = "onBackward";
}(ControllerEventEnum = exports.ControllerEventEnum || (exports.ControllerEventEnum = {})), 
function(ControllerTypeEnum) {
    ControllerTypeEnum.Start = "start", ControllerTypeEnum.Pause = "pause", ControllerTypeEnum.Forward = "forward", 
    ControllerTypeEnum.Backward = "backward";
}(ControllerTypeEnum = exports.ControllerTypeEnum || (exports.ControllerTypeEnum = {}));
//# sourceMappingURL=constant.js.map
