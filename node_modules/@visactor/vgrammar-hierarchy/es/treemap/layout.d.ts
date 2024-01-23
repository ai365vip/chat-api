import type { TreemapOptions, TreemapNodeElement, TreemapData } from '../interface';
export declare class TreemapLayout {
    private options;
    private _splitNode;
    private _getNodeKey?;
    private _maxDepth;
    static defaultOpionts: Partial<TreemapOptions>;
    constructor(options?: TreemapOptions);
    private _filterByArea;
    layout(data: TreemapData, config: {
        x0: number;
        x1: number;
        y0: number;
        y1: number;
    } | {
        width: number;
        height: number;
    }): TreemapNodeElement[];
    private _getMinAreaByDepth;
    private _getGapWidthByDepth;
    private _getPaddingByDepth;
    private _getLabelPaddingByDepth;
    private _filterChildren;
    private _layout;
    private _layoutNode;
}
