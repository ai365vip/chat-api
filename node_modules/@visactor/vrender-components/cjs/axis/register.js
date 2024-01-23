"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadCircleAxisGridComponent = exports.loadLineAxisGridComponent = exports.loadCircleAxisComponent = exports.loadLineAxisComponent = void 0;

const vrender_kits_1 = require("@visactor/vrender-kits");

function loadBasicAxis() {
    (0, vrender_kits_1.registerGroup)(), (0, vrender_kits_1.registerLine)(), (0, vrender_kits_1.registerRichtext)(), 
    (0, vrender_kits_1.registerText)();
}

function loadLineAxisComponent() {
    loadBasicAxis(), (0, vrender_kits_1.registerRect)();
}

function loadCircleAxisComponent() {
    loadBasicAxis(), (0, vrender_kits_1.registerCircle)();
}

function loadLineAxisGridComponent() {
    (0, vrender_kits_1.registerGroup)(), (0, vrender_kits_1.registerPath)();
}

function loadCircleAxisGridComponent() {
    (0, vrender_kits_1.registerGroup)(), (0, vrender_kits_1.registerPath)();
}

exports.loadLineAxisComponent = loadLineAxisComponent, exports.loadCircleAxisComponent = loadCircleAxisComponent, 
exports.loadLineAxisGridComponent = loadLineAxisGridComponent, exports.loadCircleAxisGridComponent = loadCircleAxisGridComponent;
//# sourceMappingURL=register.js.map