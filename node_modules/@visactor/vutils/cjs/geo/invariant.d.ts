import type { Feature, MultiPolygon, Polygon, Units } from './interface';
import type { IPointLike } from '../data-structure';
export declare function isPointInPolygon<G extends Polygon | MultiPolygon>(point: IPointLike, polygon: Feature<G> | G): boolean;
export declare function destination(point: IPointLike, distance: number, bearing: number, options?: {
    units?: Units;
}): {
    x: number;
    y: number;
};
