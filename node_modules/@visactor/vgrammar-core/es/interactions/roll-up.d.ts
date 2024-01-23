import type { EventType, IView, InteractionEvent, RollUpOptions } from '../types';
import { Filter } from './filter';
export declare class RollUp extends Filter {
    static type: string;
    type: string;
    static defaultOptions: Omit<RollUpOptions, 'target'>;
    options: RollUpOptions;
    protected _isToggle: boolean;
    constructor(view: IView, options?: RollUpOptions);
    protected getEvents(): {
        type: EventType;
        handler: (event: InteractionEvent) => void;
    }[];
    protected handleStart: (event: InteractionEvent) => void;
    protected handleReset: (event: InteractionEvent) => void;
}
