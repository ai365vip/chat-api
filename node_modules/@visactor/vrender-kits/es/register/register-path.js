import { container, pathModule, registerPathGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { pathCanvasPickModule } from "../picker/contributions/canvas-picker/path-module";

import { pathMathPickModule } from "../picker/contributions/math-picker/path-module";

function _registerPath() {
    _registerPath.__loaded || (_registerPath.__loaded = !0, registerPathGraphic(), container.load(pathModule), 
    container.load(browser ? pathCanvasPickModule : pathMathPickModule));
}

_registerPath.__loaded = !1;

export const registerPath = _registerPath;
//# sourceMappingURL=register-path.js.map