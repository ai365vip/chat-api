import type { IGraphicRender, IRenderService, ISymbol, IGraphicAttribute, IContext2d, IGraphic, IMarkAttribute, IThemeAttribute, IDrawContext, IGraphicRenderDrawParams } from '@visactor/vrender-core';
import { BaseRender } from '@visactor/vrender-core';
export declare class RoughCanvasSymbolRender extends BaseRender<ISymbol> implements IGraphicRender {
    readonly canvasRenderer: IGraphicRender;
    type: 'symbol';
    numberType: number;
    style: 'rough';
    constructor(canvasRenderer: IGraphicRender);
    draw(symbol: ISymbol, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
    drawShape(graphic: IGraphic, ctx: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
