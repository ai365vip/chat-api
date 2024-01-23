import type { IGlobal, ICanvas, IContext2d, IDrawToParams, IGroup, ILayer, ILayerHandlerContribution, IWindow, ILayerHandlerInitParams, ILayerHandlerDrawParams, IDrawContext, LayerMode } from '../../../interface';
import type { IBounds } from '@visactor/vutils';
export declare class CanvasLayerHandlerContribution implements ILayerHandlerContribution {
    layer: ILayer;
    canvas: ICanvas;
    context: IContext2d;
    offscreen: boolean;
    main: boolean;
    window: IWindow;
    type: LayerMode;
    global: IGlobal;
    secondaryHandlers: ILayerHandlerContribution[];
    constructor();
    setDpr(dpr: number): void;
    init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void;
    resize(w: number, h: number): void;
    resizeView(w: number, h: number): void;
    render(group: IGroup[], params: ILayerHandlerDrawParams, userParams?: Partial<IDrawContext>): void;
    merge(layerHandlers: ILayerHandlerContribution[]): void;
    prepare(dirtyBounds: IBounds, params: ILayerHandlerDrawParams): void;
    drawTo(target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams): void;
    getContext(): IContext2d;
    release(): void;
}
