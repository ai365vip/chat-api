import type { IGraphicAttribute, IContext2d, IGlyph, IMarkAttribute, IThemeAttribute, IDrawContext, IRenderService, IGraphicRender, IGraphicRenderDrawParams } from '../../../interface';
export declare class DefaultCanvasGlyphRender implements IGraphicRender {
    type: 'glyph';
    numberType: number;
    drawShape(glyph: IGlyph, context: IContext2d, x: number, y: number, drawContext: IDrawContext, params?: IGraphicRenderDrawParams, fillCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean, strokeCb?: (ctx: IContext2d, markAttribute: Partial<IMarkAttribute & IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean): void;
    draw(glyph: IGlyph, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams): void;
}
