import type { Transform } from '.';
export interface IStatisticsOptions {
    fields: string[];
    operations: Array<'count' | 'max' | 'min' | 'mean' | 'average' | 'median' | 'mode' | 'product' | 'standardDeviation' | 'sum' | 'sumSimple' | 'variance'>;
    as?: string[];
    groupBy?: string;
}
export declare const statistics: Transform;
