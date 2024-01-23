import type { IPointLike } from '@visactor/vutils';
import { Coordinate } from './base';
import type { ICartesianCoordinate, IDimensionType } from './interface';
export declare class CartesianCoordinate extends Coordinate implements ICartesianCoordinate {
    readonly type = "cartesian";
    convert(point: IPointLike | [number, number]): IPointLike;
    invert(point: IPointLike): IPointLike;
    getRangeByDimension(dim: IDimensionType, isSubshaft?: boolean, reversed?: boolean): [number, number];
    getVisualPositionByDimension(dim: IDimensionType, isSubshaft?: boolean, reversed?: boolean): "top" | "bottom" | "right" | "left";
    getAxisPointsByDimension(dim: IDimensionType, isSubshaft?: boolean, reversed?: boolean, baseValue?: number): [IPointLike, IPointLike];
    private convertPoint;
    private invertPoint;
}
