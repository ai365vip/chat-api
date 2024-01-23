import { container, vglobal } from "@visactor/vrender-core";

import { loadBrowserEnv } from "./browser";

import { loadFeishuEnv } from "./feishu";

import { loadLynxEnv } from "./lynx";

import { loadNodeEnv } from "./node";

import { loadTaroEnv } from "./taro";

import { loadWxEnv } from "./wx";

import { loadCanvasPicker } from "../picker/canvas-module";

import { loadMathPicker } from "../picker/math-module";

export function loadAllEnv(container) {
    loadAllModule(container);
}

export function loadAllModule(container) {
    loadAllModule.__loaded || (loadAllModule.__loaded = !0, loadBrowserEnv(container, !1), 
    loadFeishuEnv(container, !1), loadLynxEnv(container, !1), loadNodeEnv(container, !1), 
    loadTaroEnv(container, !1), loadWxEnv(container, !1), loadCanvasPicker(container), 
    vglobal.hooks.onSetEnv.tap("loadMathPicker", ((lastEnv, env) => {
        "browser" !== env && loadMathPicker(container);
    })));
}

loadAllModule.__loaded = !1;

export function initAllEnv() {
    loadAllEnv(container);
}
//# sourceMappingURL=all.js.map