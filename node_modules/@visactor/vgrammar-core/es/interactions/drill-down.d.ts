import type { IPolygon } from '@visactor/vrender-core';
import type { DrillDownOptions, IView, InteractionEvent } from '../types';
import { BrushBase } from './brush-base';
import { type IBounds } from '@visactor/vutils';
import type { FilterMixin } from './filter';
export interface DrillDown extends Pick<FilterMixin, '_data' | '_filterValue' | '_dataFilter' | 'handleFilter' | '_filterData'>, BrushBase<DrillDownOptions> {
}
export declare class DrillDown extends BrushBase<DrillDownOptions> {
    static type: string;
    type: string;
    static defaultOptions: Omit<DrillDownOptions, 'target'>;
    constructor(view: IView, option?: DrillDownOptions);
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
    handleTrigger: (event: InteractionEvent) => void;
}
