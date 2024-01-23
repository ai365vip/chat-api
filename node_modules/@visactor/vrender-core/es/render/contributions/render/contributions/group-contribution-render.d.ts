import type { IGraphicAttribute, IContext2d, IGroup, IThemeAttribute, IGroupRenderContribution, IDrawContext } from '../../../../interface';
import { DefaultBaseBackgroundRenderContribution } from './base-contribution-render';
import { BaseRenderContributionTime } from '../../../../common/enums';
export declare class DefaultGroupBackgroundRenderContribution extends DefaultBaseBackgroundRenderContribution implements IGroupRenderContribution {
    time: BaseRenderContributionTime;
    drawShape(graphic: IGroup, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, graphicAttribute: Required<IGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
export declare const defaultGroupBackgroundRenderContribution: DefaultGroupBackgroundRenderContribution;
