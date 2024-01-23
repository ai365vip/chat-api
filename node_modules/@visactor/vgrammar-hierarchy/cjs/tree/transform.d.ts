import type { HierarchicalData, TreeLinkElement, TreeNodeElement, TreeTramsformOptions } from '../interface';
export declare const transform: (options: TreeTramsformOptions, upstreamData: HierarchicalData) => TreeNodeElement[] | {
    nodes: TreeNodeElement[];
    links: TreeLinkElement[];
};
