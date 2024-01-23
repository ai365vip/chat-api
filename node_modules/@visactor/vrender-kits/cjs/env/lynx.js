"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initLynxEnv = exports.loadLynxEnv = exports.lynxEnvModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), math_module_1 = require("../picker/math-module"), lynx_contribution_1 = require("../window/contributions/lynx-contribution"), modules_1 = require("../canvas/contributions/lynx/modules"), lynx_contribution_2 = require("./contributions/lynx-contribution");

function loadLynxEnv(container, loadPicker = !0) {
    loadLynxEnv.__loaded || (loadLynxEnv.__loaded = !0, container.load(exports.lynxEnvModule), 
    container.load(modules_1.lynxCanvasModule), container.load(lynx_contribution_1.lynxWindowModule), 
    loadPicker && (0, math_module_1.loadMathPicker)(container));
}

function initLynxEnv() {
    loadLynxEnv(vrender_core_1.container);
}

exports.lynxEnvModule = new vrender_core_1.ContainerModule((bind => {
    exports.lynxEnvModule.isLynxBound || (exports.lynxEnvModule.isLynxBound = !0, bind(lynx_contribution_2.LynxEnvContribution).toSelf().inSingletonScope(), 
    bind(vrender_core_1.EnvContribution).toService(lynx_contribution_2.LynxEnvContribution));
})), exports.lynxEnvModule.isLynxBound = !1, exports.loadLynxEnv = loadLynxEnv, 
loadLynxEnv.__loaded = !1, exports.initLynxEnv = initLynxEnv;
//# sourceMappingURL=lynx.js.map