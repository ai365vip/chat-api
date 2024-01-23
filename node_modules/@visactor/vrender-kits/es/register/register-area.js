import { areaModule, container, registerAreaGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { areaCanvasPickModule } from "../picker/contributions/canvas-picker/area-module";

import { areaMathPickModule } from "../picker/contributions/math-picker/area-module";

function _registerArea() {
    _registerArea.__loaded || (_registerArea.__loaded = !0, registerAreaGraphic(), container.load(areaModule), 
    container.load(browser ? areaCanvasPickModule : areaMathPickModule));
}

_registerArea.__loaded = !1;

export const registerArea = _registerArea;
//# sourceMappingURL=register-area.js.map