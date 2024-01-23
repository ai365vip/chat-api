import { registerGroupGraphic } from "@visactor/vrender-core";

function _registerGroup() {
    _registerGroup.__loaded || (_registerGroup.__loaded = !0, registerGroupGraphic());
}

_registerGroup.__loaded = !1;

export const registerGroup = _registerGroup;
//# sourceMappingURL=register-group.js.map