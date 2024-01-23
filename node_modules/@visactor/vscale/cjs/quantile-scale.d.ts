import type { DiscretizingScaleType, IBaseScale } from './interface';
export declare class QuantileScale implements IBaseScale {
    readonly type: DiscretizingScaleType;
    protected _range: any[];
    protected _domain: number[];
    protected _thresholds: number[];
    protected _unknown: any;
    unknown(): any[];
    unknown(_: any): this;
    rescale(slience?: boolean): this;
    scale(x: any): any;
    invertExtent(y: any): number[];
    quantiles(): number[];
    domain(): any[];
    domain(_: any[], slience?: boolean): this;
    range(): any[];
    range(_: any[], slience?: boolean): this;
    clone(): QuantileScale;
}
