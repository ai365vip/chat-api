import type { ContinuousScaleType } from './interface';
import { LinearScale } from './linear-scale';
export declare class PowScale extends LinearScale {
    readonly type: ContinuousScaleType;
    _exponent: number;
    constructor();
    clone(): PowScale;
    rescale(slience?: boolean): this;
    exponent(): number;
    exponent(_: number, slience?: boolean): this;
}
