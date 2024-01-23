import type { DiscretizingScaleType, IBaseScale } from './interface';
export declare class QuantizeScale implements IBaseScale {
    readonly type: DiscretizingScaleType;
    protected _range: any[];
    protected _domain: number[];
    protected x0: number;
    protected x1: number;
    protected n: number;
    protected _unknown: any;
    unknown(): any[];
    unknown(_: any): this;
    rescale(slience?: boolean): this;
    scale(x: any): any;
    invertExtent(y: any): number[];
    thresholds(): number[];
    domain(): any[];
    domain(_: any[], slience?: boolean): this;
    range(): any[];
    range(_: any[], slience?: boolean): this;
    clone(): QuantizeScale;
    ticks(count?: number): number[];
    forceTicks(count?: number): any[];
    stepTicks(step: number): any[];
    nice(count?: number): this;
    niceMin(count?: number): this;
    niceMax(count?: number): this;
}
