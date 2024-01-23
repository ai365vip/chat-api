import type { DiscretizingScaleType, IBaseScale } from './interface';
export declare class ThresholdScale implements IBaseScale {
    readonly type: DiscretizingScaleType;
    protected _range: any[];
    protected _domain: number[];
    protected n: number;
    protected _unknown: any;
    unknown(): any[];
    unknown(_: any): this;
    scale(x: any): any;
    invertExtent(y: any): number[];
    domain(): any[];
    domain(_: any[]): this;
    range(): any[];
    range(_: any[]): this;
    clone(): ThresholdScale;
}
