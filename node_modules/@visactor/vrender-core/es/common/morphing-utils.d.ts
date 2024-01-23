import type { IMatrix } from '@visactor/vutils';
import type { ICustomPath2D } from '../interface';
import { CustomPath2D } from './custom-path2d';
export declare function cubicSubdivide(p0: number, p1: number, p2: number, p3: number, t: number, out: number[]): void;
export declare function alignSubpath(subpath1: number[], subpath2: number[]): [number[], number[]];
export declare function centroidOfSubpath(array: number[]): number[];
export declare function findBestMorphingRotation(fromArr: number[][], toArr: number[][], searchAngleIteration: number, searchAngleRange: number): {
    from: number[];
    to: number[];
    fromCp: number[];
    toCp: number[];
    rotation: number;
}[];
export declare function alignBezierCurves(array1: number[][], array2: number[][]): number[][][];
export declare function pathToBezierCurves(path: ICustomPath2D): number[][];
export declare function applyTransformOnBezierCurves(bezierCurves: number[][], martrix: IMatrix): void;
export declare function bezierCurversToPath(bezierCurves: number[][]): CustomPath2D;
