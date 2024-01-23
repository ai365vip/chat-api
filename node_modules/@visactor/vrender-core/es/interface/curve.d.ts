import type { IPoint, IPointLike } from '@visactor/vutils';
import type { ICurvePath } from './path';
import type { ICurveType, IDirection } from './common';
export interface ISegPath2D extends ICurvePath<IPoint> {
    direction: IDirection;
    curveType: ICurveType;
    endX: number;
    endY: number;
    tryUpdateLength: (direction?: IDirection) => number;
    bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, defined: boolean, p?: IPointLike) => void;
    closePath: () => void;
    ellipse: (x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean) => void;
    lineTo: (x: number, y: number, defined: boolean, p?: IPointLike) => void;
    moveTo: (x: number, y: number, p?: IPointLike) => void;
    quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => void;
}
export interface IGenSegmentParams {
    direction?: IDirection;
    startPoint?: IPointLike;
}
export interface IBaseSegment {
    context: ISegPath2D;
    lineStart: () => void;
    lineEnd: () => void;
    areaStart: () => void;
    areaEnd: () => void;
    _x: number;
    _y: number;
    _x0: number;
    _x1: number;
    _y0: number;
    _y1: number;
    _line: number;
    _point: number;
}
export interface ILinearSegment extends IBaseSegment {
    point: (point: IPointLike) => void;
    tryUpdateLength: () => number;
}
export interface ICurvedSegment extends IBaseSegment {
    point: (point: IPointLike) => void;
}
