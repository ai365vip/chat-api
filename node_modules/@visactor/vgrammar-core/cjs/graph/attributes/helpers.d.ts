import type { IPointLike } from '@visactor/vutils';
import type { MarkElementItem, MarkType } from '../../types';
export declare function isValidPointsChannel(channels: string[], markType: MarkType): boolean;
export declare function getRulePoints(nextAttrs: {
    x: number;
    y: number;
    x1: number;
    y1: number;
}): {
    x: number;
    y: number;
}[];
export declare function getLinePoints(items?: MarkElementItem[], includeOnePoint?: boolean, lastPoints?: IPointLike[], isArea?: boolean): any[];
export declare function getLargeRectsPoints(items?: MarkElementItem[], includeOnePoint?: boolean, lastPoints?: Float32Array | number[]): Float32Array | number[];
export declare function getLargeSymbolsPoints(items?: MarkElementItem[], includeOnePoint?: boolean, lastPoints?: Float32Array | number[]): Float32Array | number[];
export declare function isPositionOrSizeChannel(type: string, channel: string): boolean;
export declare function isPointsMarkType(markType: MarkType): boolean;
