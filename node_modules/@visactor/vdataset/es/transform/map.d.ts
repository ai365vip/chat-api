import type { Transform } from '.';
export interface IMapOptions {
    callback?: (item: any, index: number, arr: any[]) => any;
}
export declare const map: Transform;
