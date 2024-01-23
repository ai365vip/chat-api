import { arcModule, container, registerArcGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { arcCanvasPickModule } from "../picker/contributions/canvas-picker/arc-module";

import { arcMathPickModule } from "../picker/contributions/math-picker/arc-module";

export function _registerArc() {
    _registerArc.__loaded || (_registerArc.__loaded = !0, registerArcGraphic(), container.load(arcModule), 
    container.load(browser ? arcCanvasPickModule : arcMathPickModule));
}

_registerArc.__loaded = !1;

export const registerArc = _registerArc;
//# sourceMappingURL=register-arc.js.map