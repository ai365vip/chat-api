import type { IGlobal, IGraphicService } from './interface';
import type { IGraphicUtil, ILayerService, ITransformUtil } from './interface/core';
export declare function preLoadAllModule(): void;
export declare namespace preLoadAllModule {
    var __loaded: boolean;
}
export declare const vglobal: IGlobal;
export declare const graphicUtil: IGraphicUtil;
export declare const transformUtil: ITransformUtil;
export declare const graphicService: IGraphicService;
export declare const layerService: ILayerService;
