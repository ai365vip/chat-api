import type { IBoundsLike } from '../../data-structure';
import type { Point } from './interface';
export declare function getAABBFromPoints(points: Point[]): IBoundsLike;
export declare function pointInAABB(point: Point, aabb: IBoundsLike): boolean;
export declare function unionAABB(bounds1: IBoundsLike, bounds2: IBoundsLike, buffer?: number, format?: boolean): [IBoundsLike, IBoundsLike?];
export declare function mergeAABB(boundsList: IBoundsLike[]): IBoundsLike[];
