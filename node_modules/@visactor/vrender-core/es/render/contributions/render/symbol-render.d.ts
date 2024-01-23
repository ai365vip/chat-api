import type { IGraphicAttribute, IContext2d, IMarkAttribute, ISymbol, IThemeAttribute, ISymbolRenderContribution, IDrawContext, IRenderService, IGraphicRender, IGraphicRenderDrawParams, IContributionProvider } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasSymbolRender extends BaseRender<ISymbol> implements IGraphicRender {
    protected readonly symbolRenderContribitions: IContributionProvider<ISymbolRenderContribution>;
    type: 'symbol';
    numberType: number;
    constructor(symbolRenderContribitions: IContributionProvider<ISymbolRenderContribution>);
    drawShape(symbol: ISymbol, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(symbol: ISymbol, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
