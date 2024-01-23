"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerRichtext = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), richtext_module_1 = require("../picker/contributions/canvas-picker/richtext-module"), richtext_module_2 = require("../picker/contributions/math-picker/richtext-module");

function _registerRichtext() {
    _registerRichtext.__loaded || (_registerRichtext.__loaded = !0, (0, vrender_core_1.registerRichtextGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.richtextModule), vrender_core_1.container.load(env_1.browser ? richtext_module_1.richtextCanvasPickModule : richtext_module_2.richTextMathPickModule));
}

_registerRichtext.__loaded = !1, exports.registerRichtext = _registerRichtext;
//# sourceMappingURL=register-richtext.js.map