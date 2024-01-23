import type { IBaseScale, ScaleType } from '@visactor/vscale';
import type { DistributiveOmit } from './base';
import type { GrammarSpec, IData } from './grammar';
import type { GenericFunctionType, SimpleSignalType } from './signal';
import type { IDimensionType } from '@visactor/vgrammar-coordinate';
export type ScaleFunctionCallback<T> = (scale: IBaseScale, parameters: any) => T;
export type ScaleFunctionType<T> = GenericFunctionType<ScaleFunctionCallback<T>, T>;
export type ScaleData = {
    data: string | IData;
    field: string | string[];
    sort?: (datumA: any, datumB: any) => number;
};
export type MultiScaleData = {
    datas: {
        data: string | IData;
        field: string | string[];
    }[];
    sort?: (datumA: any, datumB: any) => number;
};
export type ScaleCoordinate = {
    coordinate: string;
    dimension: IDimensionType;
    isSubshaft?: boolean;
    reversed?: boolean;
};
export type GrammarScaleType = ScaleType | 'utc';
export interface BaseScaleSpec extends GrammarSpec {
    name?: string;
    type: GrammarScaleType;
    domain?: ScaleData | MultiScaleData | ScaleFunctionType<any[]>;
    unknown?: ScaleFunctionType<any>;
}
export interface ScaleTicksSpec {
    nice?: ScaleFunctionType<boolean | number>;
    niceMax?: ScaleFunctionType<boolean | number>;
    niceMin?: ScaleFunctionType<boolean | number>;
}
export interface ScaleDomainSpec {
    min?: ScaleFunctionType<number>;
    max?: ScaleFunctionType<number>;
    zero?: ScaleFunctionType<boolean>;
}
export interface DiscreteScaleSpec extends BaseScaleSpec {
    range?: ScaleFunctionType<any[]> | ScaleData | MultiScaleData | ScaleCoordinate;
}
export interface OrdinalScaleSpec extends DiscreteScaleSpec {
    type: 'ordinal';
}
export interface BaseBandScaleSpec extends DiscreteScaleSpec {
    round?: ScaleFunctionType<boolean>;
    padding?: ScaleFunctionType<number>;
    paddingInner?: ScaleFunctionType<number>;
    paddingOuter?: ScaleFunctionType<number>;
    align?: ScaleFunctionType<number>;
}
export interface BandScaleSpec extends BaseBandScaleSpec {
    type: 'band';
}
export interface PointScaleSpec extends BaseBandScaleSpec {
    type: 'point';
}
export interface ContinuousScaleSpec extends BaseScaleSpec, ScaleDomainSpec {
    tickCount?: SimpleSignalType<number>;
    range?: ScaleFunctionType<number[]> | ScaleData | MultiScaleData | ScaleCoordinate;
    roundRange?: ScaleFunctionType<boolean>;
    config?: {
        clamp?: boolean | ((x: number) => any);
        interpolate?: (t: number) => any;
    };
}
export interface LinearScaleSpec extends ContinuousScaleSpec, ScaleTicksSpec {
    type: 'linear';
}
export interface PowScaleSpec extends ContinuousScaleSpec, ScaleTicksSpec {
    type: 'pow';
    exponent?: ScaleFunctionType<number>;
}
export interface LogScaleSpec extends ContinuousScaleSpec, Pick<ScaleTicksSpec, 'nice'> {
    type: 'log';
    base?: ScaleFunctionType<number>;
}
export interface SqrtScaleSpec extends ContinuousScaleSpec, ScaleTicksSpec {
    type: 'sqrt';
}
export interface SymlogScaleSpec extends ContinuousScaleSpec, ScaleTicksSpec {
    type: 'symlog';
    constant?: ScaleFunctionType<number>;
}
export interface TimeScaleSpec extends ContinuousScaleSpec, Pick<ScaleTicksSpec, 'nice'> {
    type: 'time';
}
export interface UtcTimeScaleSpec extends ContinuousScaleSpec, Pick<ScaleTicksSpec, 'nice'> {
    type: 'utc';
}
export interface QuantizeScaleSpec extends BaseScaleSpec, ScaleTicksSpec, ScaleDomainSpec {
    type: 'quantize';
    range?: ScaleFunctionType<any[]> | ScaleData | MultiScaleData;
}
export interface QuantileScaleSpec extends BaseScaleSpec {
    type: 'quantile';
    range?: ScaleFunctionType<any[]> | ScaleData | MultiScaleData;
}
export interface ThresholdScaleSpec extends BaseScaleSpec {
    type: 'threshold';
    range?: ScaleFunctionType<any[]> | ScaleData | MultiScaleData;
}
export interface IdentityScaleSpec extends BaseScaleSpec {
    type: 'identity';
    range?: ScaleFunctionType<any[]> | ScaleData | MultiScaleData;
}
export type ScaleSpec = OrdinalScaleSpec | BandScaleSpec | PointScaleSpec | LinearScaleSpec | PowScaleSpec | LogScaleSpec | SqrtScaleSpec | SymlogScaleSpec | TimeScaleSpec | UtcTimeScaleSpec | QuantizeScaleSpec | QuantileScaleSpec | ThresholdScaleSpec | IdentityScaleSpec;
export type ScaleConfigureSpec = DistributiveOmit<ScaleSpec, 'type'>;
