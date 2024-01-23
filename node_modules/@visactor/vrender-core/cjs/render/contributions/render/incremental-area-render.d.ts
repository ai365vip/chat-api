import type { IArea, IAreaGraphicAttribute, IAreaSegment, IGraphicAttribute, IContext2d, IMarkAttribute, IThemeAttribute, IGraphicRender, IGraphicRenderDrawParams, IDrawContext } from '../../../interface';
import { DefaultCanvasAreaRender } from './area-render';
export declare class DefaultIncrementalCanvasAreaRender extends DefaultCanvasAreaRender implements IGraphicRender {
    type: 'area';
    numberType: number;
    drawShape(area: IArea, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    drawIncreaseSegment(area: IArea, context: IContext2d, lastSeg: IAreaSegment, seg: IAreaSegment, attribute: Partial<IAreaGraphicAttribute>, defaultAttribute: Required<IAreaGraphicAttribute> | Partial<IAreaGraphicAttribute>[], offsetX: number, offsetY: number): void;
}
