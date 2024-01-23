"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initWxEnv = exports.loadWxEnv = exports.wxEnvModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), math_module_1 = require("../picker/math-module"), modules_1 = require("../canvas/contributions/wx/modules"), wx_contribution_1 = require("../window/contributions/wx-contribution"), wx_contribution_2 = require("./contributions/wx-contribution");

function loadWxEnv(container, loadPicker = !0) {
    loadWxEnv.__loaded || (loadWxEnv.__loaded = !0, container.load(exports.wxEnvModule), 
    container.load(modules_1.wxCanvasModule), container.load(wx_contribution_1.wxWindowModule), 
    loadPicker && (0, math_module_1.loadMathPicker)(container));
}

function initWxEnv() {
    loadWxEnv(vrender_core_1.container);
}

exports.wxEnvModule = new vrender_core_1.ContainerModule((bind => {
    exports.wxEnvModule._isWxBound || (exports.wxEnvModule._isWxBound = !0, bind(wx_contribution_2.WxEnvContribution).toSelf().inSingletonScope(), 
    bind(vrender_core_1.EnvContribution).toService(wx_contribution_2.WxEnvContribution));
})), exports.wxEnvModule._isWxBound = !1, exports.loadWxEnv = loadWxEnv, loadWxEnv.__loaded = !1, 
exports.initWxEnv = initWxEnv;
//# sourceMappingURL=wx.js.map