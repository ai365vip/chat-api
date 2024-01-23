import type { IGraphicAttribute, IContext2d, IMarkAttribute, IPolygon, IThemeAttribute, IGraphicRender, IPolygonRenderContribution, IContributionProvider, IDrawContext, IGraphicRenderDrawParams, IRenderService } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasPolygonRender extends BaseRender<IPolygon> implements IGraphicRender {
    protected readonly polygonRenderContribitions: IContributionProvider<IPolygonRenderContribution>;
    type: 'polygon';
    numberType: number;
    constructor(polygonRenderContribitions: IContributionProvider<IPolygonRenderContribution>);
    drawShape(polygon: IPolygon, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(polygon: IPolygon, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
