import { BaseRenderContributionTime } from '../../../../common/enums';
import type { IArcGraphicAttribute, IArea, IAreaRenderContribution, IContext2d, IDrawContext, IGraphicAttribute, IThemeAttribute } from '../../../../interface';
import { DefaultBaseTextureRenderContribution } from './base-texture-contribution-render';
export declare class DefaultAreaTextureRenderContribution extends DefaultBaseTextureRenderContribution implements IAreaRenderContribution {
    time: BaseRenderContributionTime;
    drawShape(graphic: IArea, context: IContext2d, x: number, y: number, doFill: boolean, doStroke: boolean, fVisible: boolean, sVisible: boolean, graphicAttribute: Required<IGraphicAttribute>, drawContext: IDrawContext, fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, options?: {
        attribute?: Partial<IArcGraphicAttribute>;
    }): void;
}
