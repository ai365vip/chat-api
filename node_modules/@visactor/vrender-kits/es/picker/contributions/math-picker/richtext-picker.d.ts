import type { IPoint } from '@visactor/vutils';
import type { IGraphicPicker, IGraphicRender, IPickParams, IRichText } from '@visactor/vrender-core';
export declare class DefaultMathRichTextPicker implements IGraphicPicker {
    readonly canvasRenderer: IGraphicRender;
    type: string;
    numberType: number;
    constructor(canvasRenderer: IGraphicRender);
    contains(richtext: IRichText, point: IPoint, params?: IPickParams): boolean;
}
