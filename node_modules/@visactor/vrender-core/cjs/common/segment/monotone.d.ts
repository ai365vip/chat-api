import type { IPointLike } from '@visactor/vutils';
import type { ICurvedSegment, IGenSegmentParams, ISegPath2D } from '../../interface/curve';
export declare class MonotoneX implements ICurvedSegment {
    protected _lastDefined1?: boolean;
    protected _lastDefined2?: boolean;
    context: ISegPath2D;
    _t0: number;
    protected startPoint?: IPointLike;
    lastPoint0?: IPointLike;
    lastPoint1?: IPointLike;
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
export declare class MonotoneY extends MonotoneX {
    context: ISegPath2D;
    protected startPoint?: IPointLike;
    constructor(context: ISegPath2D, startPoint?: IPointLike);
    point(p: IPointLike): void;
}
export declare function genMonotoneXTypeSegments(path: MonotoneX, points: IPointLike[]): void;
export declare function genMonotoneXSegments(points: IPointLike[], params?: IGenSegmentParams): ISegPath2D | null;
export declare function genMonotoneYTypeSegments(path: MonotoneX, points: IPointLike[]): void;
export declare function genMonotoneYSegments(points: IPointLike[], params?: IGenSegmentParams): ISegPath2D | null;
