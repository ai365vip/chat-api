import type { IRichTextCharacter } from '@visactor/vrender-core';
import type { TitleAttrs } from '@visactor/vrender-components';
import type { IGroupMark, ITheme, IView, MarkFunctionType, Nil, RecursivePartial } from '../types';
import type { ITitle, TitleSpec } from '../types/component';
import { Component } from '../view/component';
export declare const generateTitleAttributes: (title?: string | number | number[] | string[] | IRichTextCharacter[], subTitle?: string | number | number[] | string[] | IRichTextCharacter[], theme?: ITheme, addition?: RecursivePartial<TitleAttrs>) => TitleAttrs;
export declare class Title extends Component implements ITitle {
    static readonly componentType: string;
    protected spec: TitleSpec;
    constructor(view: IView, group?: IGroupMark);
    protected parseAddition(spec: TitleSpec): this;
    title(text: MarkFunctionType<string | number | number[] | string[] | IRichTextCharacter[]> | Nil): this;
    subTitle(text: MarkFunctionType<string | number | number[] | string[] | IRichTextCharacter[]> | Nil): this;
    protected _updateComponentEncoders(): void;
}
export declare const registerTitle: () => void;
