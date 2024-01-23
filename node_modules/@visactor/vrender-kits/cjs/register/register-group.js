"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGroup = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

function _registerGroup() {
    _registerGroup.__loaded || (_registerGroup.__loaded = !0, (0, vrender_core_1.registerGroupGraphic)());
}

_registerGroup.__loaded = !1, exports.registerGroup = _registerGroup;
//# sourceMappingURL=register-group.js.map