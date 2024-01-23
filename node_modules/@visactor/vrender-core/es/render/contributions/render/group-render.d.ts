import type { IGraphicAttribute, IContext2d, IGroup, IMarkAttribute, IThemeAttribute, IGroupRenderContribution, IDrawContext, IRenderService, IGraphicRender, IGraphicRenderDrawParams, IContributionProvider } from '../../../interface';
export declare class DefaultCanvasGroupRender implements IGraphicRender {
    protected readonly groupRenderContribitions: IContributionProvider<IGroupRenderContribution>;
    type: 'group';
    numberType: number;
    _groupRenderContribitions: IGroupRenderContribution[];
    constructor(groupRenderContribitions: IContributionProvider<IGroupRenderContribution>);
    drawShape(group: IGroup, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(group: IGroup, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
