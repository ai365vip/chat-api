import type { Point, OBB } from './interface';
export declare function getOBBFromLine(point1: Point, point2: Point, lineWidth: number): OBB;
export declare function pointInOBB(point: Point, obb: OBB): boolean;
export declare function pointInLine(point: Point, point1: Point, point2: Point, lineWidth: number): boolean;
export declare function pointBetweenLine(point: Point, point1: Point, point2: Point): boolean;
