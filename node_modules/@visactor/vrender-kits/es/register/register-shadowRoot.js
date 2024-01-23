import { registerShadowRootGraphic } from "@visactor/vrender-core";

function _registerShadowRoot() {
    _registerShadowRoot.__loaded || (_registerShadowRoot.__loaded = !0, registerShadowRootGraphic());
}

_registerShadowRoot.__loaded = !1;

export const registerShadowRoot = _registerShadowRoot;
//# sourceMappingURL=register-shadowRoot.js.map