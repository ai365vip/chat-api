"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerImage = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), env_1 = require("./env"), image_module_1 = require("../picker/contributions/canvas-picker/image-module"), image_module_2 = require("../picker/contributions/math-picker/image-module");

function _registerImage() {
    _registerImage.__loaded || (_registerImage.__loaded = !0, (0, vrender_core_1.registerImageGraphic)(), 
    vrender_core_1.container.load(vrender_core_1.imageModule), vrender_core_1.container.load(env_1.browser ? image_module_1.imageCanvasPickModule : image_module_2.imageMathPickModule));
}

_registerImage.__loaded = !1, exports.registerImage = _registerImage;
//# sourceMappingURL=register-image.js.map