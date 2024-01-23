import type { IPath2D, ICustomPath2D, ILineCurve } from '../../../interface';
export declare class CurveContext implements IPath2D {
    path: ICustomPath2D;
    private _lastX;
    private _lastY;
    private _startX;
    private _startY;
    constructor(path: ICustomPath2D);
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): void;
    protected addLinearCurve(x: number, y: number): ILineCurve;
    quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    arcTo(aX1: number, aY1: number, aX2: number, aY2: number, aRadius: number): void;
    ellipse(aX: number, aY: number, xRadius: number, yRadius: number, aRotation: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void;
    rect(x: number, y: number, w: number, h: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
    closePath(): void;
}
