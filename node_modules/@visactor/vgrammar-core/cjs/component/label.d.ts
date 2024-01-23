import type { BaseLabelAttrs, DataLabelAttrs } from '@visactor/vrender-components';
import type { BaseSingleEncodeSpec, IGroupMark, IMark, ITheme, IView, MarkFunctionType, Nil } from '../types';
import type { ILabel, LabelSpec } from '../types/component';
import { Component } from '../view/component';
export declare const generateLabelAttributes: (marks: IMark[], groupSize: {
    width: number;
    height: number;
}, encoder: BaseSingleEncodeSpec, labelStyle: MarkFunctionType<Partial<BaseLabelAttrs>>, parameters: any, theme?: ITheme) => DataLabelAttrs;
export declare class Label extends Component implements ILabel {
    static readonly componentType: string;
    protected spec: LabelSpec;
    constructor(view: IView, group?: IGroupMark);
    protected parseAddition(spec: LabelSpec): this;
    labelStyle(style: MarkFunctionType<Partial<BaseLabelAttrs>>): this;
    size(size: LabelSpec['size']): this;
    target(mark: IMark | IMark[] | string | string[] | Nil): this;
    protected _updateComponentEncoders(): void;
}
export declare const registerLabel: () => void;
