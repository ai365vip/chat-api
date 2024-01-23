"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.createModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

function createModule(CanvasConstructor, ContextConstructor) {
    return new vrender_core_1.ContainerModule((bind => {
        bind(vrender_core_1.CanvasFactory).toDynamicValue((() => params => new CanvasConstructor(params))).whenTargetNamed(CanvasConstructor.env), 
        bind(vrender_core_1.Context2dFactory).toDynamicValue((() => (params, dpr) => new ContextConstructor(params, dpr))).whenTargetNamed(ContextConstructor.env);
    }));
}

exports.createModule = createModule;
//# sourceMappingURL=create-canvas-module.js.map