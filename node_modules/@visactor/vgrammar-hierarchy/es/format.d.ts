import type { TreeLinkElement, TreemapNodeElement, TreeNodeElement } from './interface';
export declare const flattenNodes: <T = TreemapNodeElement>(nodes: TreemapNodeElement[], output?: T[], options?: {
    maxDepth?: number;
    callback?: (node: TreemapNodeElement) => T;
}) => T[];
export declare const flattenTreeLinks: <T = TreeLinkElement>(nodes: TreeNodeElement[], output?: T[], options?: {
    maxDepth?: number;
    callback?: (link: TreeLinkElement) => T;
}) => T[];
