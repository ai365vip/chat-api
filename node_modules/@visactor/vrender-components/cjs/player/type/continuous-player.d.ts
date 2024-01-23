import type { BasePlayerAttributes } from './base';
import type { BasePlayerLayoutAttributes } from './layout';
export type ContinuousPlayerAttributes = {
    type: 'continuous';
    totalDuration?: number;
    interval?: number;
} & BasePlayerAttributes & BasePlayerLayoutAttributes;
