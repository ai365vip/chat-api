"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerSymbol = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), symbol_module_1 = require("../picker/contributions/canvas-picker/symbol-module"), symbol_module_2 = require("../picker/contributions/math-picker/symbol-module");

function _registerSymbol() {
    _registerSymbol.__loaded || (_registerSymbol.__loaded = !0, (0, vrender_core_1.registerSymbolGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.symbolModule), vrender_core_1.container.load(env_1.browser ? symbol_module_1.symbolCanvasPickModule : symbol_module_2.symbolMathPickModule));
}

_registerSymbol.__loaded = !1, exports.registerSymbol = _registerSymbol;
//# sourceMappingURL=register-symbol.js.map