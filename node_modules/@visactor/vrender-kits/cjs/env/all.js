"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initAllEnv = exports.loadAllModule = exports.loadAllEnv = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), browser_1 = require("./browser"), feishu_1 = require("./feishu"), lynx_1 = require("./lynx"), node_1 = require("./node"), taro_1 = require("./taro"), wx_1 = require("./wx"), canvas_module_1 = require("../picker/canvas-module"), math_module_1 = require("../picker/math-module");

function loadAllEnv(container) {
    loadAllModule(container);
}

function loadAllModule(container) {
    loadAllModule.__loaded || (loadAllModule.__loaded = !0, (0, browser_1.loadBrowserEnv)(container, !1), 
    (0, feishu_1.loadFeishuEnv)(container, !1), (0, lynx_1.loadLynxEnv)(container, !1), 
    (0, node_1.loadNodeEnv)(container, !1), (0, taro_1.loadTaroEnv)(container, !1), 
    (0, wx_1.loadWxEnv)(container, !1), (0, canvas_module_1.loadCanvasPicker)(container), 
    vrender_core_1.vglobal.hooks.onSetEnv.tap("loadMathPicker", ((lastEnv, env) => {
        "browser" !== env && (0, math_module_1.loadMathPicker)(container);
    })));
}

function initAllEnv() {
    loadAllEnv(vrender_core_1.container);
}

exports.loadAllEnv = loadAllEnv, exports.loadAllModule = loadAllModule, loadAllModule.__loaded = !1, 
exports.initAllEnv = initAllEnv;
//# sourceMappingURL=all.js.map