import type { IBounds } from '@visactor/vutils';
import type { IPath2D } from '../interface';
export declare class BoundsContext implements IPath2D {
    bounds: IBounds;
    constructor(bounds: IBounds);
    init(bounds: IBounds): void;
    arc(cx: number, cy: number, r: number, sa: number, ea: number, ccw: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    closePath(): void;
    ellipse(): void;
    lineTo(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    clear(): void;
    release(...params: any): void;
}
