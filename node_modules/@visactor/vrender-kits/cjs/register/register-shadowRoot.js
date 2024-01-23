"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerShadowRoot = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

function _registerShadowRoot() {
    _registerShadowRoot.__loaded || (_registerShadowRoot.__loaded = !0, (0, vrender_core_1.registerShadowRootGraphic)());
}

_registerShadowRoot.__loaded = !1, exports.registerShadowRoot = _registerShadowRoot;
//# sourceMappingURL=register-shadowRoot.js.map