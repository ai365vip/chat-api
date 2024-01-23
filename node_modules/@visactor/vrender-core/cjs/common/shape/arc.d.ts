import type { ICustomPath2D } from '../../interface';
export declare function segments(x: number, y: number, rx: number, ry: number, large: number, sweep: number, rotateX: number, ox: number, oy: number): number[][];
export declare function bezier(params: number[]): number[];
export declare function drawArc(context: ICustomPath2D, x: number, y: number, coords: [number, number, number, number, number, number, number]): void;
export declare const addArcToBezierPath: (bezierPath: number[], startAngle: number, endAngle: number, cx: number, cy: number, rx: number, ry: number) => void;
