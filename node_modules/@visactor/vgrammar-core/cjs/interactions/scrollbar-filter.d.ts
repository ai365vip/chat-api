import type { DataFilterOptions, IView } from '../types';
import { Filter } from './filter';
export declare class ScrollbarFilter extends Filter {
    static type: string;
    type: string;
    static defaultOptions: Omit<DataFilterOptions, 'target'>;
    options: DataFilterOptions;
    constructor(view: IView, options?: DataFilterOptions);
    protected getEvents(): {
        type: string;
        handler: (event?: import("../types").InteractionEvent) => void;
    }[];
}
