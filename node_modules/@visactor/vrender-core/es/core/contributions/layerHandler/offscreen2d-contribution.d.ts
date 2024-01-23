import type { IGlobal, ICanvas, IContext2d, IDrawToParams, IGroup, ILayer, ILayerHandlerContribution, ILayerHandlerInitParams, IWindow, ILayerHandlerDrawParams, LayerMode } from '../../../interface';
import type { IBoundsLike } from '@visactor/vutils';
export declare class OffscreenLayerHandlerContribution implements ILayerHandlerContribution {
    layer: ILayer;
    canvas: ICanvas;
    context: IContext2d;
    offscreen: boolean;
    type: LayerMode;
    secondaryHandlers: ILayerHandlerContribution[];
    global: IGlobal;
    constructor();
    setDpr(dpr: number): void;
    init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void;
    resize(w: number, h: number): void;
    resizeView(w: number, h: number): void;
    render(group: IGroup[], params: ILayerHandlerDrawParams): void;
    prepare(dirtyBounds: IBoundsLike, params: ILayerHandlerDrawParams): void;
    release(): void;
    getContext(): IContext2d;
    drawTo(target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams): void;
    merge(layerHandlers: ILayerHandlerContribution[]): void;
}
