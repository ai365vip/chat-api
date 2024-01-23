import type { ICustomPath2D } from './../interface/path';
import type { IPointLike } from '@visactor/vutils';
import type { ILine, IRect, IArc, ICircle, IArea, IPolygon, IPath } from '../interface';
export declare function splitToGrids(width: number, height: number, count: number): number[];
export declare const splitRect: (rect: IRect, count: number) => {
    x: number;
    y: number;
    width: number;
    height: number;
}[];
export declare const splitArc: (arc: IArc, count: number) => {
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
}[];
export declare const splitCircle: (arc: ICircle, count: number) => {
    innerRadius: number;
    outerRadius: number;
    startAngle: any;
    endAngle: any;
}[];
export declare const splitArea: (area: IArea, count: number) => {
    points: IPointLike[];
}[];
export declare const splitLine: (line: ILine, count: number) => IPointLike[];
export declare const binarySplitPolygon: (points: IPointLike[]) => {
    x: number;
    y: number;
}[][];
export declare const recursiveCallBinarySplit: (points: IPointLike[], count: number, out: {
    points: IPointLike[];
}[]) => void;
export declare const splitPolygon: (polygon: IPolygon, count: number) => {
    points: {
        x: number;
        y: number;
    }[];
}[];
export declare const splitPath: (path: IPath, count: number) => {
    path: ICustomPath2D;
}[] | {
    points: IPointLike[];
}[];
