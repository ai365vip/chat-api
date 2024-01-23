import type { CirclePackingOptions, CirclePackingNodeElement, HierarchicalData } from '../interface';
export declare class CirclePackingLayout {
    private options;
    private _getNodeKey?;
    private _getPadding?;
    private _maxDepth;
    static defaultOpionts: Partial<CirclePackingOptions>;
    constructor(options?: CirclePackingOptions);
    layout(data: HierarchicalData, config: {
        x0: number;
        x1: number;
        y0: number;
        y1: number;
    } | {
        width: number;
        height: number;
    }): CirclePackingNodeElement[];
}
