import { ContainerModule, CanvasFactory, Context2dFactory } from "@visactor/vrender-core";

export function createModule(CanvasConstructor, ContextConstructor) {
    return new ContainerModule((bind => {
        bind(CanvasFactory).toDynamicValue((() => params => new CanvasConstructor(params))).whenTargetNamed(CanvasConstructor.env), 
        bind(Context2dFactory).toDynamicValue((() => (params, dpr) => new ContextConstructor(params, dpr))).whenTargetNamed(ContextConstructor.env);
    }));
}
//# sourceMappingURL=create-canvas-module.js.map