import { container, registerRichtextGraphic, richtextModule } from "@visactor/vrender-core";

import { browser } from "./env";

import { richtextCanvasPickModule } from "../picker/contributions/canvas-picker/richtext-module";

import { richTextMathPickModule } from "../picker/contributions/math-picker/richtext-module";

function _registerRichtext() {
    _registerRichtext.__loaded || (_registerRichtext.__loaded = !0, registerRichtextGraphic(), 
    container.load(richtextModule), container.load(browser ? richtextCanvasPickModule : richTextMathPickModule));
}

_registerRichtext.__loaded = !1;

export const registerRichtext = _registerRichtext;
//# sourceMappingURL=register-richtext.js.map