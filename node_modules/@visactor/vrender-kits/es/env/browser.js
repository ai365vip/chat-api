import { container, ContainerModule, EnvContribution } from "@visactor/vrender-core";

import { browserCanvasModule } from "../canvas/contributions/browser/modules";

import { loadCanvasPicker } from "../picker/canvas-module";

import { browserWindowModule } from "../window/contributions/browser-contribution";

import { BrowserEnvContribution } from "./contributions/browser-contribution";

export const browserEnvModule = new ContainerModule((bind => {
    browserEnvModule.isBrowserBound || (browserEnvModule.isBrowserBound = !0, bind(BrowserEnvContribution).toSelf().inSingletonScope(), 
    bind(EnvContribution).toService(BrowserEnvContribution));
}));

browserEnvModule.isBrowserBound = !1;

export function loadBrowserEnv(container, loadPicker = !0) {
    loadBrowserEnv.__loaded || (loadBrowserEnv.__loaded = !0, container.load(browserEnvModule), 
    container.load(browserCanvasModule), container.load(browserWindowModule), loadPicker && loadCanvasPicker(container));
}

loadBrowserEnv.__loaded = !1;

export function initBrowserEnv() {
    loadBrowserEnv(container);
}
//# sourceMappingURL=browser.js.map