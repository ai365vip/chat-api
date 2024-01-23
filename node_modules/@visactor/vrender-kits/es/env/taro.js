import { container, ContainerModule, EnvContribution } from "@visactor/vrender-core";

import { loadMathPicker } from "../picker/math-module";

import { taroCanvasModule } from "../canvas/contributions/taro/modules";

import { taroWindowModule } from "../window/contributions/taro-contribution";

import { TaroEnvContribution } from "./contributions/taro-contribution";

export const taroEnvModule = new ContainerModule((bind => {
    taroEnvModule.isTaroBound || (taroEnvModule.isTaroBound = !0, bind(TaroEnvContribution).toSelf().inSingletonScope(), 
    bind(EnvContribution).toService(TaroEnvContribution));
}));

taroEnvModule.isTaroBound = !1;

export function loadTaroEnv(container, loadPicker = !0) {
    loadTaroEnv.__loaded || (loadTaroEnv.__loaded = !0, container.load(taroEnvModule), 
    container.load(taroCanvasModule), container.load(taroWindowModule), loadPicker && loadMathPicker(container));
}

loadTaroEnv.__loaded = !1;

export function initTaroEnv() {
    loadTaroEnv(container);
}
//# sourceMappingURL=taro.js.map