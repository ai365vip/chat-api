import type { DateLikeType } from '../interface';
export declare function toDateNumber(t: DateLikeType): number;
export declare function getTickInterval(min: Date, max: Date, tickCount: number, isUTC?: boolean): {
    floor: (date: Date) => Date;
    offset: (date: Date, s: number) => Date;
    ceil: (date: Date) => Date;
};
