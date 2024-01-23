import { registerWrapTextGraphic } from "@visactor/vrender-core";

function _registerWrapText() {
    _registerWrapText.__loaded || (_registerWrapText.__loaded = !0, registerWrapTextGraphic());
}

_registerWrapText.__loaded = !1;

export const registerWrapText = _registerWrapText;
//# sourceMappingURL=register-wraptext.js.map