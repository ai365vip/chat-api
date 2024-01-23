import type { SliderAttributes } from '@visactor/vrender-components';
import type { IGroupMark, ITheme, IView, MarkFunctionType, Nil, RecursivePartial } from '../types';
import type { ISlider, SliderSpec } from '../types/component';
import { Component } from '../view/component';
export declare const generateSliderAttributes: (min: number, max: number, theme?: ITheme, addition?: RecursivePartial<SliderAttributes>) => SliderAttributes;
export declare class Slider extends Component implements ISlider {
    static readonly componentType: string;
    protected spec: SliderSpec;
    constructor(view: IView, group?: IGroupMark);
    protected parseAddition(spec: SliderSpec): this;
    min(min: MarkFunctionType<number> | Nil): this;
    max(max: MarkFunctionType<number> | Nil): this;
    setStartEndValue(start?: number, end?: number): this;
    protected _updateComponentEncoders(): void;
}
export declare const registerSlider: () => void;
