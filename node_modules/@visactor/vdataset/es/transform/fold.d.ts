import type { Transform } from '.';
export interface IFoldOptions {
    fields: string[];
    key: string;
    value: string;
    retains?: string[];
}
export declare const fold: Transform;
