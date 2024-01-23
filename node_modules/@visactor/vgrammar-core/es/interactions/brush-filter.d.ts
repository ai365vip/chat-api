import type { IPolygon } from '@visactor/vrender-core';
import type { BrushFilterOptions, IView } from '../types';
import { BrushBase } from './brush-base';
import { type IBounds } from '@visactor/vutils';
import type { FilterMixin } from './filter';
export interface BrushFilter extends Pick<FilterMixin, '_data' | '_filterValue' | '_dataFilter' | 'handleFilter' | '_filterData'>, BrushBase<BrushFilterOptions> {
}
export declare class BrushFilter extends BrushBase<BrushFilterOptions> {
    static type: string;
    type: string;
    static defaultOptions: Omit<BrushFilterOptions, 'target'>;
    constructor(view: IView, option?: BrushFilterOptions);
    protected getEvents(): {
        type: string;
        handler: import("../types").InteractionEventHandler;
    }[];
    handleBrushUpdate: (event: {
        type: string;
        detail: {
            operateMask: IPolygon;
            operatedMaskAABBBounds: {
                [name: string]: IBounds;
            };
        };
    }) => void;
}
