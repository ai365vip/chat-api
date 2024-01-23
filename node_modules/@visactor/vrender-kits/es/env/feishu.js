import { container, ContainerModule, EnvContribution } from "@visactor/vrender-core";

import { feishuCanvasModule } from "../canvas/contributions/feishu/modules";

import { feishuWindowModule } from "../window/contributions/feishu-contribution";

import { loadMathPicker } from "../picker/math-module";

import { FeishuEnvContribution } from "./contributions/feishu-contribution";

export const feishuEnvModule = new ContainerModule((bind => {
    feishuEnvModule.isFeishuBound || (feishuEnvModule.isFeishuBound = !0, bind(FeishuEnvContribution).toSelf().inSingletonScope(), 
    bind(EnvContribution).toService(FeishuEnvContribution));
}));

feishuEnvModule.isFeishuBound = !1;

export function loadFeishuEnv(container, loadPicker = !0) {
    loadFeishuEnv.__loaded || (loadFeishuEnv.__loaded = !0, container.load(feishuEnvModule), 
    container.load(feishuCanvasModule), container.load(feishuWindowModule), loadPicker && loadMathPicker(container));
}

loadFeishuEnv.__loaded = !1;

export function initFeishuEnv() {
    loadFeishuEnv(container);
}
//# sourceMappingURL=feishu.js.map