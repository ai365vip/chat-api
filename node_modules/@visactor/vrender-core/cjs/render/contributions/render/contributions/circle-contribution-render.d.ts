import type { IGraphicAttribute, IContext2d, IMarkAttribute, ICircle, ICircleGraphicAttribute, IThemeAttribute, ICircleRenderContribution, IDrawContext } from '../../../../interface';
import { BaseRenderContributionTime } from '../../../../common/enums';
export declare class DefaultCircleRenderContribution implements ICircleRenderContribution {
    time: BaseRenderContributionTime;
    useStyle: boolean;
    order: number;
    drawShape(circle: ICircle, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, circleAttribute: Required<ICircleGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
export declare const defaultCircleRenderContribution: DefaultCircleRenderContribution;
export declare const defaultCircleTextureRenderContribution: import("./base-texture-contribution-render").DefaultBaseTextureRenderContribution;
export declare const defaultCircleBackgroundRenderContribution: import("./base-contribution-render").DefaultBaseBackgroundRenderContribution;
