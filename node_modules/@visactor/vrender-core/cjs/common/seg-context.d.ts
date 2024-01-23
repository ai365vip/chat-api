import type { IPoint, IPointLike } from '@visactor/vutils';
import type { ICurve, ICurveType, IDirection, ILineCurve, ISegPath2D } from '../interface';
export declare class SegContext implements ISegPath2D {
    private _lastX;
    private _lastY;
    private _startX;
    private _startY;
    private _lastOriginP?;
    private _startOriginP?;
    get endX(): number;
    get endY(): number;
    curves: ICurve<IPoint>[];
    direction: IDirection;
    curveType: ICurveType;
    length: number;
    constructor(curveType: ICurveType, direction: IDirection);
    init(curveType: ICurveType, direction: IDirection): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, defined: boolean, p: IPointLike): void;
    closePath(): void;
    ellipse(): void;
    lineTo(x: number, y: number, defined: boolean, p: IPointLike): void;
    moveTo(x: number, y: number, p: IPointLike): ISegPath2D;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    clear(): void;
    tryUpdateLength(direction?: IDirection): number;
    protected addLinearCurve(x: number, y: number, defined: boolean, p1: IPointLike, p2: IPointLike): ILineCurve;
    getPointAt(t: number): IPoint;
    getCurveLengths(): number[];
    getLength(direction?: IDirection): number;
}
export declare class ReflectSegContext extends SegContext {
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, defined: boolean, p: IPointLike): void;
    lineTo(x: number, y: number, defined: boolean, p: IPointLike): void;
    moveTo(x: number, y: number, p: IPointLike): ISegPath2D;
    clear(): void;
}
