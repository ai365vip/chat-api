import { LinearScale } from './linear-scale';
import type { ContinuousScaleType } from './interface';
export declare class SqrtScale extends LinearScale {
    readonly type: ContinuousScaleType;
    constructor();
    clone(): SqrtScale;
}
