"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadTagComponent = void 0;

const vrender_kits_1 = require("@visactor/vrender-kits");

function loadTagComponent() {
    (0, vrender_kits_1.registerGroup)(), (0, vrender_kits_1.registerRect)(), (0, vrender_kits_1.registerSymbol)(), 
    (0, vrender_kits_1.registerRichtext)(), (0, vrender_kits_1.registerText)();
}

exports.loadTagComponent = loadTagComponent;
//# sourceMappingURL=register.js.map
