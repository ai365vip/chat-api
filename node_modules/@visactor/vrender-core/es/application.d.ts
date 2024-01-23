import type { ILayerService } from './interface/core';
import type { IGraphicUtil, ITransformUtil } from './interface/core';
import type { IGlobal, IGraphicService } from './interface';
export declare class Application {
    global: IGlobal;
    graphicUtil: IGraphicUtil;
    graphicService: IGraphicService;
    transformUtil: ITransformUtil;
    layerService: ILayerService;
}
export declare const application: Application;
