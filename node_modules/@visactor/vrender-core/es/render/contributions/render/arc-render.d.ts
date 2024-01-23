import type { IContext2d, IArc, IPath2D, IGraphicAttribute, IMarkAttribute, IThemeAttribute, IArcRenderContribution, IDrawContext, IRenderService, IGraphicRender, IGraphicRenderDrawParams, IContributionProvider } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasArcRender extends BaseRender<IArc> implements IGraphicRender {
    protected readonly arcRenderContribitions: IContributionProvider<IArcRenderContribution>;
    type: 'arc';
    numberType: number;
    constructor(arcRenderContribitions: IContributionProvider<IArcRenderContribution>);
    drawArcTailCapPath(arc: IArc, context: IContext2d | IPath2D, cx: number, cy: number, outerRadius: number, innerRadius: number, _sa: number, _ea: number): boolean;
    drawShape(arc: IArc, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(arc: IArc, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
