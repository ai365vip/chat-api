import { ContinuousScale } from './continuous-scale';
import type { ContinuousScaleType, DateLikeType, FloorCeilType } from './interface';
export declare class TimeScale extends ContinuousScale {
    readonly type: ContinuousScaleType;
    _isUtc?: boolean;
    constructor(isUtc?: boolean);
    invert(y: number): Date;
    domain(): Date[];
    domain(_: DateLikeType[], slience?: boolean): this;
    ticks(interval?: number | FloorCeilType<Date>): Date[];
    tickFormat(count?: number, specifier?: string): (time: import("@visactor/vutils/es/common/toDate").DateLikeType) => string;
    clone(): TimeScale;
    nice(interval?: number | FloorCeilType<Date>): this;
    utc(): boolean;
}
