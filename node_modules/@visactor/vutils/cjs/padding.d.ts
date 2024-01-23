export type IPadding = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};
export declare function normalizePadding(padding: number | number[] | IPadding): number[];
