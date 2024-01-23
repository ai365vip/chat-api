import type { IPointLike } from '@visactor/vutils';
export interface IPolarPoint {
    r: number;
    theta: number;
    r1?: number;
    theta1?: number;
    defined?: boolean;
    clone: () => IPolarPoint;
    copyFrom: (p: IPolarPoint) => IPolarPoint;
    set: (x: number, y: number) => IPolarPoint;
    add: (point: IPolarPoint | number) => IPolarPoint;
    sub: (point: IPolarPoint | number) => IPolarPoint;
    multi: (point: IPolarPoint | number) => IPolarPoint;
    div: (point: IPolarPoint | number) => IPolarPoint;
}
export declare type IPolarPointLike = Pick<IPolarPoint, 'r' | 'theta' | 'r1' | 'theta1' | 'defined'>;
export type CoordinateType = 'cartesian' | 'polar';
export type CoordinateTransform = {
    type: 'translate';
    offset: {
        x: number;
        y: number;
    };
} | {
    type: 'rotate';
    angle: number;
} | {
    type: 'scale';
    scale: {
        x: number;
        y: number;
    };
} | {
    type: 'transpose';
};
export interface IBaseCoordinate {
    readonly type: CoordinateType;
    start: (() => IPointLike) & ((point: IPointLike) => this) & ((point: [number, number]) => this) & ((x: number, y: number) => this);
    end: (() => IPointLike) & ((point: IPointLike) => this) & ((point: [number, number]) => this) & ((x: number, y: number) => this);
    convert: (...args: any[]) => any;
    invert: (...args: any[]) => any;
    isTransposed: () => boolean;
    isMainDimension: (dim: IDimensionType) => boolean;
    applyTransforms: (transforms: CoordinateTransform[]) => this;
    getRangeByDimension: (dim: IDimensionType, isSubshaft?: boolean, reversed?: boolean) => [number, number];
    getVisualPositionByDimension: (dim: IDimensionType, isSubshaft?: boolean, reversed?: boolean) => string;
    getAxisPointsByDimension: (dim: IDimensionType, isSubshaft?: boolean, reversed?: boolean, baseValue?: number) => [IPointLike, IPointLike] | null;
}
export interface ICartesianCoordinate extends IBaseCoordinate {
    convert: (point: IPointLike) => IPointLike;
    invert: (point: IPointLike) => IPointLike;
}
export type IDimensionType = 'r' | 'theta' | 'x' | 'y' | '0' | '1';
export interface IPolarCoordinate extends IBaseCoordinate {
    origin: (() => IPointLike) & ((point: IPointLike) => this) & ((point: [number, number]) => this) & ((x: number, y: number) => this);
    angle: (() => [number, number]) & ((sa: number, ea: number) => this) & ((a: [number, number]) => this);
    radius: (() => [number, number]) & ((ir: number, or: number) => this) & ((r: [number, number]) => this);
    convert: (point: IPolarPointLike) => IPointLike;
    invert: (point: IPointLike) => IPolarPointLike;
}
