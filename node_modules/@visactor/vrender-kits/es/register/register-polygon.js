import { container, polygonModule, registerPolygonGraphic } from "@visactor/vrender-core";

import { browser } from "./env";

import { polygonCanvasPickModule } from "../picker/contributions/canvas-picker/polygon-module";

import { polygonMathPickModule } from "../picker/contributions/math-picker/polygon-module";

function _registerPolygon() {
    _registerPolygon.__loaded || (_registerPolygon.__loaded = !0, registerPolygonGraphic(), 
    container.load(polygonModule), container.load(browser ? polygonCanvasPickModule : polygonMathPickModule));
}

_registerPolygon.__loaded = !1;

export const registerPolygon = _registerPolygon;
//# sourceMappingURL=register-polygon.js.map