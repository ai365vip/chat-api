import type { IContext2d, IGraphic, IGraphicAttribute, IInteractiveSubRenderContribution, IThemeAttribute, IDrawContext } from '@visactor/vrender-core';
import { PopTip } from './poptip';
export declare class PopTipRenderContribution implements IInteractiveSubRenderContribution {
    poptipComponent: PopTip;
    render(graphic: IGraphic<Partial<IGraphicAttribute>>, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, graphicAttribute: Required<IGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, options?: any): void;
}
