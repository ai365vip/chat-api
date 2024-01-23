import { container, ContainerModule, EnvContribution } from "@visactor/vrender-core";

import { loadMathPicker } from "../picker/math-module";

import { lynxWindowModule } from "../window/contributions/lynx-contribution";

import { lynxCanvasModule } from "../canvas/contributions/lynx/modules";

import { LynxEnvContribution } from "./contributions/lynx-contribution";

export const lynxEnvModule = new ContainerModule((bind => {
    lynxEnvModule.isLynxBound || (lynxEnvModule.isLynxBound = !0, bind(LynxEnvContribution).toSelf().inSingletonScope(), 
    bind(EnvContribution).toService(LynxEnvContribution));
}));

lynxEnvModule.isLynxBound = !1;

export function loadLynxEnv(container, loadPicker = !0) {
    loadLynxEnv.__loaded || (loadLynxEnv.__loaded = !0, container.load(lynxEnvModule), 
    container.load(lynxCanvasModule), container.load(lynxWindowModule), loadPicker && loadMathPicker(container));
}

loadLynxEnv.__loaded = !1;

export function initLynxEnv() {
    loadLynxEnv(container);
}
//# sourceMappingURL=lynx.js.map