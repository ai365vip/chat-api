import { container, rect3dModule, registerRect3dGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { rect3dCanvasPickModule } from "../picker/contributions/canvas-picker/rect3d-module";

function _registerRect3d() {
    _registerRect3d.__loaded || (_registerRect3d.__loaded = !0, registerRect3dGraphic(), 
    container.load(rect3dModule), container.load(rect3dCanvasPickModule));
}

_registerRect3d.__loaded = !1;

export const registerRect3d = _registerRect3d;
//# sourceMappingURL=register-rect3d.js.map