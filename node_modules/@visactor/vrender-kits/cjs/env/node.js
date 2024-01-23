"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.initNodeEnv = exports.loadNodeEnv = exports.nodeEnvModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), modules_1 = require("../canvas/contributions/node/modules"), node_contribution_1 = require("../window/contributions/node-contribution"), node_contribution_2 = require("./contributions/node-contribution");

function loadNodeEnv(container, loadPicker = !0) {
    loadNodeEnv.__loaded || (loadNodeEnv.__loaded = !0, container.load(exports.nodeEnvModule), 
    container.load(modules_1.nodeCanvasModule), container.load(node_contribution_1.nodeWindowModule));
}

function initNodeEnv() {
    loadNodeEnv(vrender_core_1.container);
}

exports.nodeEnvModule = new vrender_core_1.ContainerModule((bind => {
    exports.nodeEnvModule.isNodeBound || (exports.nodeEnvModule.isNodeBound = !0, bind(node_contribution_2.NodeEnvContribution).toSelf().inSingletonScope(), 
    bind(vrender_core_1.EnvContribution).toService(node_contribution_2.NodeEnvContribution));
})), exports.nodeEnvModule.isNodeBound = !1, exports.loadNodeEnv = loadNodeEnv, 
loadNodeEnv.__loaded = !1, exports.initNodeEnv = initNodeEnv;
//# sourceMappingURL=node.js.map