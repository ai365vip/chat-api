import { container, registerTextGraphic, textModule } from "@visactor/vrender-core";

import { browser } from "./env";

import { textCanvasPickModule } from "../picker/contributions/canvas-picker/text-module";

import { textMathPickModule } from "../picker/contributions/math-picker/text-module";

function _registerText() {
    _registerText.__loaded || (_registerText.__loaded = !0, registerTextGraphic(), container.load(textModule), 
    container.load(browser ? textCanvasPickModule : textMathPickModule));
}

_registerText.__loaded = !1;

export const registerText = _registerText;
//# sourceMappingURL=register-text.js.map