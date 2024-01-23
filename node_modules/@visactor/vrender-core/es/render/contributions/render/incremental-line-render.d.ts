import type { IContext2d, ILine, ILineGraphicAttribute, IMarkAttribute, IGraphicAttribute, IThemeAttribute, ISegment, IGraphicRender, IGraphicRenderDrawParams, IDrawContext } from '../../../interface';
import { DefaultCanvasLineRender } from './line-render';
export declare class DefaultIncrementalCanvasLineRender extends DefaultCanvasLineRender implements IGraphicRender {
    type: 'line';
    numberType: number;
    drawShape(line: ILine, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    drawIncreaseSegment(line: ILine, context: IContext2d, lastSeg: ISegment, seg: ISegment, attribute: Partial<ILineGraphicAttribute>, defaultAttribute: Required<ILineGraphicAttribute> | Partial<ILineGraphicAttribute>[], offsetX: number, offsetY: number): void;
}
