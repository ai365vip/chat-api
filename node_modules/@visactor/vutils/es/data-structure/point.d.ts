export interface IPoint {
    x: number;
    y: number;
    x1?: number;
    y1?: number;
    defined?: boolean;
    context?: any;
    clone: () => IPoint;
    copyFrom: (p: IPointLike) => IPoint;
    set: (x: number, y: number) => IPoint;
    add: (point: IPointLike | number) => IPoint;
    sub: (point: IPointLike | number) => IPoint;
    multi: (point: IPointLike | number) => IPoint;
    div: (point: IPointLike | number) => IPoint;
}
export type IPointLike = Pick<IPoint, 'x' | 'y' | 'x1' | 'y1' | 'defined' | 'context'>;
export declare class Point implements IPoint {
    x: number;
    y: number;
    x1?: number;
    y1?: number;
    defined?: boolean;
    context?: any;
    constructor(x?: number, y?: number, x1?: number, y1?: number);
    clone(): Point;
    copyFrom(p: IPointLike): this;
    set(x: number, y: number): this;
    add(point: IPointLike | number): IPoint;
    sub(point: IPointLike | number): IPoint;
    multi(point: IPointLike | number): IPoint;
    div(point: IPointLike | number): IPoint;
}
export declare class PointService {
    static distancePP(p1: IPointLike, p2: IPointLike): number;
    static distanceNN(x: number, y: number, x1: number, y1: number): number;
    static distancePN(point: IPointLike, x: number, y: number): number;
    static pointAtPP(p1: IPointLike, p2: IPointLike, t: number): IPoint;
}
export interface IPolarPoint {
    r: number;
    theta: number;
    r1?: number;
    theta1?: number;
    defined?: boolean;
    context?: any;
    clone: () => IPolarPoint;
    copyFrom: (p: IPolarPoint) => IPolarPoint;
    set: (x: number, y: number) => IPolarPoint;
}
export declare type IPolarPointLike = Pick<IPolarPoint, 'r' | 'theta' | 'r1' | 'theta1' | 'defined' | 'context'>;
export declare class PolarPoint implements IPolarPoint {
    r: number;
    theta: number;
    r1?: number;
    theta1?: number;
    defined?: boolean;
    context?: any;
    constructor(r?: number, theta?: number, r1?: number, theta1?: number);
    clone(): PolarPoint;
    copyFrom(p: IPolarPointLike): this;
    set(r: number, theta: number): this;
}
