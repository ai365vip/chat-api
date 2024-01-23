"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadContinuousPlayerComponent = exports.loadDiscretePlayerComponent = void 0;

const vrender_kits_1 = require("@visactor/vrender-kits"), register_1 = require("../slider/register");

function loadBasePlayer() {
    (0, register_1.loadSliderComponent)(), (0, vrender_kits_1.registerGroup)(), (0, 
    vrender_kits_1.registerSymbol)();
}

function loadDiscretePlayerComponent() {
    loadBasePlayer();
}

function loadContinuousPlayerComponent() {
    loadBasePlayer();
}

exports.loadDiscretePlayerComponent = loadDiscretePlayerComponent, exports.loadContinuousPlayerComponent = loadContinuousPlayerComponent;
//# sourceMappingURL=register.js.map
