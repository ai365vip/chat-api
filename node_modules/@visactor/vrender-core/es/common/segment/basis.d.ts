import type { IPointLike } from '@visactor/vutils';
import type { ICurvedSegment, IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';
export declare function point(curveClass: Basis, x: number, y: number, defined: boolean, p: IPointLike): void;
export declare class Basis implements ICurvedSegment {
    private _lastDefined1?;
    private _lastDefined2?;
    context: ISegPath2D;
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
export declare function genBasisTypeSegments(path: ILinearSegment, points: IPointLike[]): void;
export declare function genBasisSegments(points: IPointLike[], params?: IGenSegmentParams): ISegPath2D | null;
