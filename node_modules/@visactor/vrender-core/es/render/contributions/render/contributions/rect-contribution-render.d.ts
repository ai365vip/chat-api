import type { IGraphicAttribute, IContext2d, IMarkAttribute, IRect, IRectGraphicAttribute, IThemeAttribute, IRectRenderContribution, IDrawContext } from '../../../../interface';
import { BaseRenderContributionTime } from '../../../../common/enums';
export declare class DefaultRectRenderContribution implements IRectRenderContribution {
    time: BaseRenderContributionTime;
    useStyle: boolean;
    order: number;
    drawShape(rect: IRect, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, rectAttribute: Required<IRectGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
export declare class SplitRectBeforeRenderContribution implements IRectRenderContribution {
    time: BaseRenderContributionTime;
    useStyle: boolean;
    order: number;
    drawShape(group: IRect, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, groupAttribute: Required<IRectGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, doFillOrStroke?: {
        doFill: boolean;
        doStroke: boolean;
    }): void;
}
export declare class SplitRectAfterRenderContribution implements IRectRenderContribution {
    time: BaseRenderContributionTime;
    useStyle: boolean;
    order: number;
    drawShape(rect: IRect, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, groupAttribute: Required<IRectGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
}
export declare const defaultRectRenderContribution: DefaultRectRenderContribution;
export declare const defaultRectTextureRenderContribution: import("./base-texture-contribution-render").DefaultBaseTextureRenderContribution;
export declare const defaultRectBackgroundRenderContribution: import("./base-contribution-render").DefaultBaseBackgroundRenderContribution;
