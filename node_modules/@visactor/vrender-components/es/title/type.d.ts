import type { IGroupGraphicAttribute, ITextGraphicAttribute, IRichTextGraphicAttribute, IRichTextCharacter, RichTextWordBreak } from '@visactor/vrender-core';
import type { Padding } from '../core/type';
export interface TitleAttrs extends IGroupGraphicAttribute {
    text?: string | number | string[] | number[] | IRichTextCharacter[];
    textType?: string;
    subtext?: string | number | string[] | number[] | IRichTextCharacter[];
    subtextType?: string;
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    padding?: Padding;
    x?: number;
    y?: number;
    align?: string;
    verticalAlign?: string;
    textStyle?: {
        width?: number;
        height?: number;
        maxWidth?: number;
        maxHeight?: number;
        align?: string;
        verticalAlign?: string;
        wordBreak?: RichTextWordBreak;
        maxLineWidth?: number;
        heightLimit?: number;
        lineClamp?: number;
        character?: IRichTextCharacter[];
        text?: string | number | string[] | number[] | IRichTextCharacter[];
    } & Partial<ITextGraphicAttribute> & Partial<IRichTextGraphicAttribute>;
    subtextStyle?: {
        width?: number;
        height?: number;
        maxWidth?: number;
        maxHeight?: number;
        align?: string;
        verticalAlign?: string;
        wordBreak?: RichTextWordBreak;
        maxLineWidth?: number;
        heightLimit?: number;
        lineClamp?: number;
        character?: IRichTextCharacter[];
    } & Partial<ITextGraphicAttribute> & Partial<IRichTextGraphicAttribute>;
}
