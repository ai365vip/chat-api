import type { TreeOptions, HierarchicalDatum, TreeNodeElement, HierarchicalData } from '../interface';
export declare class TreeLayout {
    private options;
    private _getNodeKey?;
    private _maxDepth;
    static defaultOpionts: Partial<TreeOptions>;
    constructor(options?: TreeOptions);
    layout(data: HierarchicalDatum | HierarchicalData, config: {
        x0: number;
        x1: number;
        y0: number;
        y1: number;
    } | {
        width: number;
        height: number;
    }): TreeNodeElement[];
}
