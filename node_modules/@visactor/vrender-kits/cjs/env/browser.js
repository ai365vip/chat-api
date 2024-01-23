"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initBrowserEnv = exports.loadBrowserEnv = exports.browserEnvModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), modules_1 = require("../canvas/contributions/browser/modules"), canvas_module_1 = require("../picker/canvas-module"), browser_contribution_1 = require("../window/contributions/browser-contribution"), browser_contribution_2 = require("./contributions/browser-contribution");

function loadBrowserEnv(container, loadPicker = !0) {
    loadBrowserEnv.__loaded || (loadBrowserEnv.__loaded = !0, container.load(exports.browserEnvModule), 
    container.load(modules_1.browserCanvasModule), container.load(browser_contribution_1.browserWindowModule), 
    loadPicker && (0, canvas_module_1.loadCanvasPicker)(container));
}

function initBrowserEnv() {
    loadBrowserEnv(vrender_core_1.container);
}

exports.browserEnvModule = new vrender_core_1.ContainerModule((bind => {
    exports.browserEnvModule.isBrowserBound || (exports.browserEnvModule.isBrowserBound = !0, 
    bind(browser_contribution_2.BrowserEnvContribution).toSelf().inSingletonScope(), 
    bind(vrender_core_1.EnvContribution).toService(browser_contribution_2.BrowserEnvContribution));
})), exports.browserEnvModule.isBrowserBound = !1, exports.loadBrowserEnv = loadBrowserEnv, 
loadBrowserEnv.__loaded = !1, exports.initBrowserEnv = initBrowserEnv;
//# sourceMappingURL=browser.js.map