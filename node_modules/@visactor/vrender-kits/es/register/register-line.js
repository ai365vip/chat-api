import { container, lineModule, registerLineGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { lineCanvasPickModule } from "../picker/contributions/canvas-picker/line-module";

import { lineMathPickModule } from "../picker/contributions/math-picker/line-module";

function _registerLine() {
    _registerLine.__loaded || (_registerLine.__loaded = !0, registerLineGraphic(), container.load(lineModule), 
    container.load(browser ? lineCanvasPickModule : lineMathPickModule));
}

_registerLine.__loaded = !1;

export const registerLine = _registerLine;
//# sourceMappingURL=register-line.js.map