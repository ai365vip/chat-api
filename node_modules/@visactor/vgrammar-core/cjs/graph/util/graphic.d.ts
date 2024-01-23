import type { IGlyphMeta, IMark } from '../../types';
import type { IGraphic } from '@visactor/vrender-core';
export declare const isMarkType: (type: string) => boolean;
export declare function createGraphicItem(mark: IMark, markType: string, attrs?: any): IGraphic<Partial<import("@visactor/vrender-core").IGraphicAttribute>>;
export declare function createGlyphGraphicItem(mark: IMark, glyphMeta: IGlyphMeta, attrs?: any): IGraphic<Partial<import("@visactor/vrender-core").IGraphicAttribute>>;
export declare const removeGraphicItem: (graphicItem: IGraphic) => void;
export declare const getMarkTypeOfLarge: (markType: string) => string;
