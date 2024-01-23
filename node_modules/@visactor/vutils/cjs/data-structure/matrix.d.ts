import type { vec2 } from '../math';
import type { IPointLike } from './point';
export interface IMatrixLike {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}
export interface IMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    setValue: (a: number, b: number, c: number, d: number, e: number, f: number) => IMatrix;
    getInverse: () => IMatrix;
    rotate: (rad: number) => IMatrix;
    rotateByCenter: (rad: number, cx: number, cy: number) => IMatrix;
    scale: (sx: number, sy: number) => IMatrix;
    setScale: (sx: number, sy: number) => IMatrix;
    transform: (a: number, b: number, c: number, d: number, e: number, f: number) => IMatrix;
    translate: (x: number, y: number) => IMatrix;
    transpose: () => IMatrix;
    equalToMatrix: (m2: IMatrixLike) => boolean;
    equalTo: (a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) => boolean;
    multiply: (a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) => IMatrix;
    interpolate: (m2: IMatrix, t: number) => IMatrix;
    transformPoint: (source: IPointLike, target: IPointLike) => void;
    reset: () => IMatrix;
    onlyTranslate: (scale?: number) => boolean;
    clone: () => IMatrix;
    toTransformAttrs: () => {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
        skewX: number;
        skewY: number;
        rotateDeg: number;
    };
}
export declare class Matrix implements IMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number);
    equalToMatrix(m2: IMatrixLike): boolean;
    equalTo(a: number, b: number, c: number, d: number, e: number, f: number): boolean;
    setValue(a: number, b: number, c: number, d: number, e: number, f: number): this;
    reset(): this;
    getInverse(): Matrix;
    rotate(rad: number): this;
    rotateByCenter(rad: number, cx: number, cy: number): this;
    scale(sx: number, sy: number): this;
    setScale(sx: number, sy: number): this;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): this;
    translate(x: number, y: number): this;
    transpose(): this;
    multiply(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number): this;
    interpolate(m2: Matrix, t: number): Matrix;
    transformPoint(source: IPointLike, target: IPointLike): void;
    onlyTranslate(scale?: number): boolean;
    clone(): Matrix;
    toTransformAttrs(): {
        x: number;
        y: number;
        rotateDeg: number;
        scaleX: number;
        scaleY: number;
        skewX: number;
        skewY: number;
    };
}
export declare function normalTransform(out: Matrix, origin: Matrix, x: number, y: number, scaleX: number, scaleY: number, angle: number, rotateCenter?: vec2): void;
