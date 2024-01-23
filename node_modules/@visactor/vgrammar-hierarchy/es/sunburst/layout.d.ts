import type { SunburstOptions, SunburstNodeElement, HierarchicalData } from '../interface';
export declare class SunburstLayout {
    private options;
    private _getNodeKey?;
    private _maxDepth;
    private _parsedCenter;
    private _parsedInnerRadius;
    private _parsedOutterRadius;
    private _maxRadius;
    static defaultOpionts: Partial<SunburstOptions>;
    constructor(options?: SunburstOptions);
    private _parseRadius;
    layout(data: HierarchicalData, config: {
        x0: number;
        x1: number;
        y0: number;
        y1: number;
    } | {
        width: number;
        height: number;
    }): SunburstNodeElement[];
    private _layout;
    private _layoutLabel;
    private _layoutNode;
}
