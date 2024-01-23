import type { IContext2d, IGraphicAttribute, IMarkAttribute, IThemeAttribute, IArc3d, IDrawContext, IRenderService, IGraphicRender, IGraphicRenderDrawParams } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasArc3DRender extends BaseRender<IArc3d> implements IGraphicRender {
    type: 'arc3d';
    numberType: number;
    z: number;
    drawShape(arc: IArc3d, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(arc: IArc3d, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
