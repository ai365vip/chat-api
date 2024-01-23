import type { IGlobal, IDrawToParams, IGroup, ILayer, ILayerHandlerContribution, IWindow, ILayerHandlerInitParams, ILayerHandlerDrawParams, IDrawContext, LayerMode } from '../../../interface';
import type { IBounds } from '@visactor/vutils';
export declare class EmptyLayerHandlerContribution implements ILayerHandlerContribution {
    layer: ILayer;
    canvas: null;
    context: null;
    offscreen: boolean;
    main: boolean;
    window: IWindow;
    type: LayerMode;
    mainHandler: ILayerHandlerContribution;
    global: IGlobal;
    constructor();
    setDpr(dpr: number): void;
    init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void;
    resize(w: number, h: number): void;
    resizeView(w: number, h: number): void;
    render(group: IGroup[], params: ILayerHandlerDrawParams, userParams?: Partial<IDrawContext>): void;
    merge(layerHandlers: ILayerHandlerContribution[]): void;
    prepare(dirtyBounds: IBounds, params: ILayerHandlerDrawParams): void;
    drawTo(target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams): void;
    getContext(): null;
    release(): void;
}
