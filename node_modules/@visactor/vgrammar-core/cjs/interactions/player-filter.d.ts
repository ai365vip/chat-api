import type { DataFilterOptions, IView } from '../types';
import { Filter } from './filter';
import { PlayerEventEnum } from '@visactor/vrender-components';
export declare class PlayerFilter extends Filter {
    static type: string;
    type: string;
    static defaultOptions: Omit<DataFilterOptions, 'target'>;
    options: DataFilterOptions;
    constructor(view: IView, options?: DataFilterOptions);
    protected getEvents(): {
        type: PlayerEventEnum;
        handler: (event?: import("../types").InteractionEvent) => void;
    }[];
}
