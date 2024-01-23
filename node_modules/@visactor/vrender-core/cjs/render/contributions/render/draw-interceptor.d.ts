import type { IContext2d, IDrawContext, IDrawContribution, IDrawItemInterceptorContribution, IGraphic, IGraphicRenderDrawParams, ILayer, IRenderService } from '../../../interface';
export declare const DrawItemInterceptor: unique symbol;
export declare class ShadowRootDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
    order: number;
    afterDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    beforeDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    protected drawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
}
export declare class DebugDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
    order: number;
    afterDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    protected drawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
}
export declare class CommonDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
    order: number;
    interceptors: IDrawItemInterceptorContribution[];
    constructor();
    afterDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    beforeDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
}
export declare class InteractiveDrawItemInterceptorContribution implements IDrawItemInterceptorContribution {
    order: number;
    processing: boolean;
    beforeDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    beforeSetInteractive(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    beforeDrawInteractive(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    getShadowRoot(interactiveLayer: ILayer): import("../../../interface").IShadowRoot;
}
export declare class Canvas3DDrawItemInterceptor implements IDrawItemInterceptorContribution {
    order: number;
    beforeDrawItem(graphic: IGraphic, renderService: IRenderService, drawContext: IDrawContext, drawContribution: IDrawContribution, params?: IGraphicRenderDrawParams): boolean;
    initCanvasCtx(context: IContext2d): void;
}
