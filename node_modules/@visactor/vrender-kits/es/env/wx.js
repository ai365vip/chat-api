import { container, ContainerModule, EnvContribution } from "@visactor/vrender-core";

import { loadMathPicker } from "../picker/math-module";

import { wxCanvasModule } from "../canvas/contributions/wx/modules";

import { wxWindowModule } from "../window/contributions/wx-contribution";

import { WxEnvContribution } from "./contributions/wx-contribution";

export const wxEnvModule = new ContainerModule((bind => {
    wxEnvModule._isWxBound || (wxEnvModule._isWxBound = !0, bind(WxEnvContribution).toSelf().inSingletonScope(), 
    bind(EnvContribution).toService(WxEnvContribution));
}));

wxEnvModule._isWxBound = !1;

export function loadWxEnv(container, loadPicker = !0) {
    loadWxEnv.__loaded || (loadWxEnv.__loaded = !0, container.load(wxEnvModule), container.load(wxCanvasModule), 
    container.load(wxWindowModule), loadPicker && loadMathPicker(container));
}

loadWxEnv.__loaded = !1;

export function initWxEnv() {
    loadWxEnv(container);
}
//# sourceMappingURL=wx.js.map