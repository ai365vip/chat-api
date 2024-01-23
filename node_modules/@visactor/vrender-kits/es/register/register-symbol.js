import { container, registerSymbolGraphic, symbolModule } from "@visactor/vrender-core";

import { browser } from "./env";

import { symbolCanvasPickModule } from "../picker/contributions/canvas-picker/symbol-module";

import { symbolMathPickModule } from "../picker/contributions/math-picker/symbol-module";

function _registerSymbol() {
    _registerSymbol.__loaded || (_registerSymbol.__loaded = !0, registerSymbolGraphic(), 
    container.load(symbolModule), container.load(browser ? symbolCanvasPickModule : symbolMathPickModule));
}

_registerSymbol.__loaded = !1;

export const registerSymbol = _registerSymbol;
//# sourceMappingURL=register-symbol.js.map