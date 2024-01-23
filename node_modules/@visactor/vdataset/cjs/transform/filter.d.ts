import type { Transform } from '.';
export interface IFilterOptions {
    callback?: (item: any) => boolean;
}
export declare const filter: Transform;
