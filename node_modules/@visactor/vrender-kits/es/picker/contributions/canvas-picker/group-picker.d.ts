import type { IPoint } from '@visactor/vutils';
import type { IGraphicPicker, IPickParams, IGroup } from '@visactor/vrender-core';
export declare class DefaultCanvasGroupPicker implements IGraphicPicker {
    type: string;
    numberType: number;
    contains(group: IGroup, point: IPoint, params?: IPickParams): boolean;
}
