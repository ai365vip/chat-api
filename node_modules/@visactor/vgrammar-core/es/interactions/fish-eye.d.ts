import type { FishEyeOptions, IMark, IScale, IView, InteractionEvent } from '../types';
import { BaseInteraction } from './base';
export declare class FishEye extends BaseInteraction<FishEyeOptions> {
    static type: string;
    type: string;
    static defaultOptions: FishEyeOptions;
    options: FishEyeOptions;
    protected _inited?: boolean;
    protected _state: Partial<Record<'x' | 'y', {
        scale?: IScale;
        focus?: number;
        distortion?: number;
        radius?: number;
        radiusRatio?: number;
    }>>;
    protected _isActive?: boolean;
    protected _marks?: IMark[];
    protected handleUpdate: (e: InteractionEvent) => void;
    constructor(view: IView, options?: FishEyeOptions);
    protected getEvents(): {
        type: string;
        handler: (e: InteractionEvent) => void;
    }[];
    protected _initStateByDim(dim: 'x' | 'y', distortion: number, scale?: string | IScale, radius?: number, radiusRatio?: number): void;
    protected _initGrammars(): void;
    updateView(focus?: {
        x: number;
        y: number;
    }, e?: InteractionEvent): void;
    shouldHandle(e: InteractionEvent): boolean;
    shouldUpdate(e: InteractionEvent): boolean;
    handleStart: (e: InteractionEvent) => void;
    handleUpdateInner: (e: InteractionEvent) => void;
    handleEnd: (e: InteractionEvent) => void;
    handleReset: (e: InteractionEvent) => void;
    unbind(): void;
}
