import { container, imageModule, registerImageGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { imageCanvasPickModule } from "../picker/contributions/canvas-picker/image-module";

import { imageMathPickModule } from "../picker/contributions/math-picker/image-module";

function _registerImage() {
    _registerImage.__loaded || (_registerImage.__loaded = !0, registerImageGraphic(), 
    container.load(imageModule), container.load(browser ? imageCanvasPickModule : imageMathPickModule));
}

_registerImage.__loaded = !1;

export const registerImage = _registerImage;
//# sourceMappingURL=register-image.js.map