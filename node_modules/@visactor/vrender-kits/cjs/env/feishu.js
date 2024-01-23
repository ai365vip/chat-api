"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initFeishuEnv = exports.loadFeishuEnv = exports.feishuEnvModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), modules_1 = require("../canvas/contributions/feishu/modules"), feishu_contribution_1 = require("../window/contributions/feishu-contribution"), math_module_1 = require("../picker/math-module"), feishu_contribution_2 = require("./contributions/feishu-contribution");

function loadFeishuEnv(container, loadPicker = !0) {
    loadFeishuEnv.__loaded || (loadFeishuEnv.__loaded = !0, container.load(exports.feishuEnvModule), 
    container.load(modules_1.feishuCanvasModule), container.load(feishu_contribution_1.feishuWindowModule), 
    loadPicker && (0, math_module_1.loadMathPicker)(container));
}

function initFeishuEnv() {
    loadFeishuEnv(vrender_core_1.container);
}

exports.feishuEnvModule = new vrender_core_1.ContainerModule((bind => {
    exports.feishuEnvModule.isFeishuBound || (exports.feishuEnvModule.isFeishuBound = !0, 
    bind(feishu_contribution_2.FeishuEnvContribution).toSelf().inSingletonScope(), bind(vrender_core_1.EnvContribution).toService(feishu_contribution_2.FeishuEnvContribution));
})), exports.feishuEnvModule.isFeishuBound = !1, exports.loadFeishuEnv = loadFeishuEnv, 
loadFeishuEnv.__loaded = !1, exports.initFeishuEnv = initFeishuEnv;
//# sourceMappingURL=feishu.js.map