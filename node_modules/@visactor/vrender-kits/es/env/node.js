import { container, ContainerModule, EnvContribution } from "@visactor/vrender-core";

import { nodeCanvasModule } from "../canvas/contributions/node/modules";

import { nodeWindowModule } from "../window/contributions/node-contribution";

import { NodeEnvContribution } from "./contributions/node-contribution";

export const nodeEnvModule = new ContainerModule((bind => {
    nodeEnvModule.isNodeBound || (nodeEnvModule.isNodeBound = !0, bind(NodeEnvContribution).toSelf().inSingletonScope(), 
    bind(EnvContribution).toService(NodeEnvContribution));
}));

nodeEnvModule.isNodeBound = !1;

export function loadNodeEnv(container, loadPicker = !0) {
    loadNodeEnv.__loaded || (loadNodeEnv.__loaded = !0, container.load(nodeEnvModule), 
    container.load(nodeCanvasModule), container.load(nodeWindowModule));
}

loadNodeEnv.__loaded = !1;

export function initNodeEnv() {
    loadNodeEnv(container);
}
//# sourceMappingURL=node.js.map