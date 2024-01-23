import type { IGraphicRender, IContext2d, IMarkAttribute, IThemeAttribute, IGraphicAttribute, ISegPath2D, ILine, ILineGraphicAttribute, IClipRangeByDimensionType } from '@visactor/vrender-core';
import { DefaultCanvasLineRender } from '@visactor/vrender-core';
export declare class RoughCanvasLineRender extends DefaultCanvasLineRender implements IGraphicRender {
    type: 'line';
    numberType: number;
    style: 'rough';
    protected drawSegmentItem(context: IContext2d, cache: ISegPath2D, fill: boolean, stroke: boolean, fillOpacity: number, strokeOpacity: number, attribute: Partial<ILineGraphicAttribute>, defaultAttribute: Required<ILineGraphicAttribute> | Partial<ILineGraphicAttribute>[], clipRange: number, clipRangeByDimension: IClipRangeByDimensionType, offsetX: number, offsetY: number, line: ILine, fillCb?: (ctx: IContext2d, lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute | IThemeAttribute[]) => boolean, strokeCb?: (ctx: IContext2d, lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute | IThemeAttribute[]) => boolean): boolean;
}
