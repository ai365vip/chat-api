import type { IGraphicAttribute, IContext2d, IMarkAttribute, IRect, IThemeAttribute, IGraphicRender, IDrawContext, IGraphicRenderDrawParams, IRenderService, IRectRenderContribution, IContributionProvider, IRectGraphicAttribute } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasRectRender extends BaseRender<IRect> implements IGraphicRender {
    protected readonly rectRenderContribitions: IContributionProvider<IRectRenderContribution>;
    type: string;
    numberType: number;
    tempTheme: Required<IRectGraphicAttribute>;
    constructor(rectRenderContribitions: IContributionProvider<IRectRenderContribution>);
    drawShape(rect: IRect, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(rect: IRect, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
