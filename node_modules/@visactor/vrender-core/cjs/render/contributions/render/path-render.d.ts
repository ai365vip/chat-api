import type { IPath, IContext2d, IThemeAttribute, IGraphicAttribute, IMarkAttribute, IPathRenderContribution, IGraphicRender, IContributionProvider, IDrawContext, IGraphicRenderDrawParams, IRenderService, IPathGraphicAttribute } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasPathRender extends BaseRender<IPath> implements IGraphicRender {
    protected readonly pathRenderContribitions: IContributionProvider<IPathRenderContribution>;
    type: 'path';
    numberType: number;
    tempTheme: Required<IPathGraphicAttribute>;
    constructor(pathRenderContribitions: IContributionProvider<IPathRenderContribution>);
    drawShape(path: IPath, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(path: IPath, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
