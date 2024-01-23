import type { TreemapNodeElement } from '../interface';
export declare function squarifyRatio(ratio: number, parent: TreemapNodeElement, x0: number, y0: number, x1: number, y1: number): (TreemapNodeElement & {
    value: number;
    children: TreemapNodeElement[];
})[];
export declare const generateSquarify: (ratio: number) => (parent: TreemapNodeElement, x0: number, y0: number, x1: number, y1: number) => void;
