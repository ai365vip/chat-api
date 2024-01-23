import type { Transform } from '.';
export interface IHexagonData {
    position: number[];
    indexes: number[];
    centerPoints: number[];
    colors: number[];
    offset: number[];
}
export interface IHexagonOptions {
    padding?: number;
    size?: number;
    calcMethod?: string;
    field?: string;
    angle?: number;
    colorConfig?: {
        type?: 'ordinal' | 'linear';
        range: Array<string>;
        field?: string;
        default?: string;
        opacity?: number;
    };
}
export declare const pointToHexbin: Transform;
