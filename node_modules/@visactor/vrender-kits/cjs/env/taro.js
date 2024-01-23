"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initTaroEnv = exports.loadTaroEnv = exports.taroEnvModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), math_module_1 = require("../picker/math-module"), modules_1 = require("../canvas/contributions/taro/modules"), taro_contribution_1 = require("../window/contributions/taro-contribution"), taro_contribution_2 = require("./contributions/taro-contribution");

function loadTaroEnv(container, loadPicker = !0) {
    loadTaroEnv.__loaded || (loadTaroEnv.__loaded = !0, container.load(exports.taroEnvModule), 
    container.load(modules_1.taroCanvasModule), container.load(taro_contribution_1.taroWindowModule), 
    loadPicker && (0, math_module_1.loadMathPicker)(container));
}

function initTaroEnv() {
    loadTaroEnv(vrender_core_1.container);
}

exports.taroEnvModule = new vrender_core_1.ContainerModule((bind => {
    exports.taroEnvModule.isTaroBound || (exports.taroEnvModule.isTaroBound = !0, bind(taro_contribution_2.TaroEnvContribution).toSelf().inSingletonScope(), 
    bind(vrender_core_1.EnvContribution).toService(taro_contribution_2.TaroEnvContribution));
})), exports.taroEnvModule.isTaroBound = !1, exports.loadTaroEnv = loadTaroEnv, 
loadTaroEnv.__loaded = !1, exports.initTaroEnv = initTaroEnv;
//# sourceMappingURL=taro.js.map