import type { IPointLike } from '@visactor/vutils';
import type { IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';
export declare class Linear implements ILinearSegment {
    context: ISegPath2D;
    protected _lastDefined?: boolean;
    protected startPoint?: IPointLike;
    constructor(context: ISegPath2D, startPoint?: IPointLike);
    _x: number;
    _y: number;
    _x0: number;
    _x1: number;
    _y0: number;
    _y1: number;
    _line: number;
    _point: number;
    areaStart(): void;
    areaEnd(): void;
    lineStart(): void;
    lineEnd(): void;
    point(p: IPointLike): void;
    tryUpdateLength(): number;
}
export declare function genLinearSegments(points: IPointLike[], params?: IGenSegmentParams): ISegPath2D | null;
export declare function genLinearTypeSegments(path: ILinearSegment, points: IPointLike[]): void;
