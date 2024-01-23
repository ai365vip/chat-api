import type { IContext2d, IRichText, IRichTextIcon, IDrawContext, IRenderService, IGraphicRender } from '../../../interface';
import { BaseRender } from './base-render';
export declare class DefaultCanvasRichTextRender extends BaseRender<IRichText> implements IGraphicRender {
    type: 'richtext';
    numberType: number;
    constructor();
    drawShape(richtext: IRichText, context: IContext2d, x: number, y: number, drawContext: IDrawContext): void;
    drawIcon(icon: IRichTextIcon, context: IContext2d, x: number, y: number, baseline: number): void;
    draw(richtext: IRichText, renderService: IRenderService, drawContext: IDrawContext): void;
}
