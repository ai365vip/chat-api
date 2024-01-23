import { vglobal } from "@visactor/vrender-core";

export function configureEnvironment(options) {
    options.mode && vglobal.setEnv(options.mode, options.modeParams || {});
}
//# sourceMappingURL=env.js.map
