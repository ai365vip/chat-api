import type { TreeNodeElement } from '../interface';
export declare function clusterTree(root: TreeNodeElement, viewBox?: {
    x0: number;
    y0: number;
    width: number;
    height: number;
}, minNodeGap?: number, linkWidth?: number | number[], separation?: (a: TreeNodeElement, b: TreeNodeElement) => number): TreeNodeElement;
