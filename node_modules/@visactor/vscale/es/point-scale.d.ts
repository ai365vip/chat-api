import { BandScale } from './band-scale';
import type { DiscreteScaleType, IBandLikeScale } from './interface';
export declare class PointScale extends BandScale implements IBandLikeScale {
    readonly type: DiscreteScaleType;
    protected _padding: number;
    constructor(slience?: boolean);
}
