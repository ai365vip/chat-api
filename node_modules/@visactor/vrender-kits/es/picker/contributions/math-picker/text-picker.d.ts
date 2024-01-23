import type { IPoint } from '@visactor/vutils';
import type { IGraphicPicker, IPickParams, IText } from '@visactor/vrender-core';
export declare class DefaultMathTextPicker implements IGraphicPicker {
    type: string;
    numberType: number;
    contains(text: IText, point: IPoint, params?: IPickParams): boolean;
}
