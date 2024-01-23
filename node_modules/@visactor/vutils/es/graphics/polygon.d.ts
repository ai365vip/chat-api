import type { IPointLike } from '../data-structure';
export declare function lineIntersectPolygon(a1x: number, a1y: number, a2x: number, a2y: number, points: IPointLike[]): boolean;
export declare function polygonContainPoint(points: IPointLike[], x: number, y: number): boolean;
export declare function isPointInLine(x0: number, y0: number, x1: number, y1: number, x: number, y: number): number;
export declare function polygonIntersectPolygon(pointsA: IPointLike[], pointsB: IPointLike[]): boolean;
