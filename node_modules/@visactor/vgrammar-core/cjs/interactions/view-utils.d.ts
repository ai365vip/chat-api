import { type IBaseScale } from '@visactor/vscale';
import type { IDatazoom, IScrollbar, ViewNavigationRange, ViewStateByDim } from '../types';
export declare const getRangeOfLinkedComponent: (comp: IDatazoom | IScrollbar) => [number, number];
export declare const getBoundsRangeOfLinkedComponent: (comp: IDatazoom | IScrollbar, dim: 'x' | 'y') => [number, number];
export declare const getFilteredValuesFromScale: (scale: IBaseScale, range: [number, number]) => any;
export declare const updateScrollRange: (rangeFactor: [number, number], range: [number, number], scrollValue?: number, scrollOptions?: {
    reversed?: boolean;
}) => [number, number];
export declare const handleScrolling: (scrollPos: {
    x?: number;
    y?: number;
}, navState: Partial<Record<'x' | 'y', ViewStateByDim>>, scrollOptions?: {
    reversed?: boolean;
}) => ViewNavigationRange;
