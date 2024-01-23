import type { IGraphicRender, IAreaCacheItem, IContext2d, IMarkAttribute, IThemeAttribute, IGraphicAttribute, IArea, IAreaGraphicAttribute, IDrawContext } from '@visactor/vrender-core';
import { DefaultCanvasAreaRender } from '@visactor/vrender-core';
export declare class RoughCanvasAreaRender extends DefaultCanvasAreaRender implements IGraphicRender {
    type: 'area';
    numberType: number;
    style: 'rough';
    protected drawSegmentItem(context: IContext2d, cache: IAreaCacheItem, fill: boolean, fillOpacity: number, stroke: boolean, strokeOpacity: number, attribute: Partial<IAreaGraphicAttribute>, defaultAttribute: Required<IAreaGraphicAttribute> | Partial<IAreaGraphicAttribute>[], clipRange: number, offsetX: number, offsetY: number, offsetZ: number, area: IArea, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute | IThemeAttribute[]) => boolean): boolean;
}
