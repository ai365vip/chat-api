import type { IElement } from '../../../types';
import type { TypeAnimation } from '../../../types/animate';
export interface IUpdateAnimationOptions {
    excludeChannels: string[];
}
export declare const update: TypeAnimation<IElement>;
