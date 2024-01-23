import { BaseRenderContributionTime } from '../../../../common/enums';
import type { IContext2d, IDrawContext, IGraphicAttribute, IText, ITextRenderContribution, IThemeAttribute } from '../../../../interface';
import { DefaultBaseBackgroundRenderContribution } from './base-contribution-render';
export declare class DefaultTextBackgroundRenderContribution extends DefaultBaseBackgroundRenderContribution implements ITextRenderContribution {
    time: BaseRenderContributionTime;
    drawShape(graphic: IText, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, graphicAttribute: Required<IGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
export declare const defaultTextBackgroundRenderContribution: DefaultTextBackgroundRenderContribution;
