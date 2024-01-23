import type { IGraphicAttribute, ICircle, IContext2d, IMarkAttribute, IThemeAttribute, ICircleRenderContribution, IDrawContext, IRenderService, IGraphicRender, IGraphicRenderDrawParams, IContributionProvider } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasCircleRender extends BaseRender<ICircle> implements IGraphicRender {
    protected readonly circleRenderContribitions: IContributionProvider<ICircleRenderContribution>;
    type: 'circle';
    numberType: number;
    constructor(circleRenderContribitions: IContributionProvider<ICircleRenderContribution>);
    drawShape(circle: ICircle, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(circle: ICircle, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
