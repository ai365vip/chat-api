"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadTooltipComponent = void 0;

const vrender_kits_1 = require("@visactor/vrender-kits");

function loadTooltipComponent() {
    (0, vrender_kits_1.registerGroup)(), (0, vrender_kits_1.registerRect)(), (0, vrender_kits_1.registerSymbol)(), 
    (0, vrender_kits_1.registerText)(), (0, vrender_kits_1.registerRichtext)();
}

exports.loadTooltipComponent = loadTooltipComponent;
//# sourceMappingURL=register.js.map
