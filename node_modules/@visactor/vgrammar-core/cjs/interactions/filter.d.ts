import type { DataFilterOptions, IData, IDataFilter, IMark, IView, InteractionEvent } from '../types';
import { BaseInteraction } from './base';
export interface FilterMixin {
    view: IView;
    _data?: IData;
    _marks?: IMark[];
    _filterValue: any;
    _dataFilter: IDataFilter;
    handleFilter: (event?: InteractionEvent) => void;
}
export declare class FilterMixin {
    _filterData(data: IData, source: IMark | null, filterRank: number, getFilterValue: (event: any) => any, filter?: (data: any[], parameters: any) => boolean, transform?: (data: any[], parameters: any) => any[]): this;
}
export interface Filter extends Pick<FilterMixin, '_data' | '_marks' | '_filterValue' | '_dataFilter' | 'handleFilter' | '_filterData'>, BaseInteraction<DataFilterOptions> {
}
export declare abstract class Filter extends BaseInteraction<DataFilterOptions> {
    static defaultOptions: Omit<DataFilterOptions, 'target'>;
    options: DataFilterOptions;
    constructor(view: IView, options?: DataFilterOptions);
}
