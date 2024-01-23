import type { IGraphicAttribute, IContext2d, IMarkAttribute, IArc, IArcGraphicAttribute, IThemeAttribute, IArcRenderContribution, IDrawContext } from '../../../../interface';
import { BaseRenderContributionTime } from '../../../../common/enums';
export declare class DefaultArcRenderContribution implements IArcRenderContribution {
    time: BaseRenderContributionTime;
    useStyle: boolean;
    order: number;
    drawShape(arc: IArc, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, arcAttribute: Required<IArcGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
export declare const defaultArcRenderContribution: DefaultArcRenderContribution;
export declare const defaultArcTextureRenderContribution: import("./base-texture-contribution-render").DefaultBaseTextureRenderContribution;
export declare const defaultArcBackgroundRenderContribution: import("./base-contribution-render").DefaultBaseBackgroundRenderContribution;
