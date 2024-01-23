import { circleModule, container, registerCircleGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { circleCanvasPickModule } from "../picker/contributions/canvas-picker/circle-module";

import { circleMathPickModule } from "../picker/contributions/math-picker/circle-module";

function _registerCircle() {
    _registerCircle.__loaded || (_registerCircle.__loaded = !0, registerCircleGraphic(), 
    container.load(circleModule), container.load(browser ? circleCanvasPickModule : circleMathPickModule));
}

_registerCircle.__loaded = !1;

export const registerCircle = _registerCircle;
//# sourceMappingURL=register-circle.js.map