import type { IMatrix, mat4 } from '@visactor/vutils';
import type { ICanvas } from './canvas';
import type { IRect } from './graphic/rect';
import type { IArc } from './graphic/arc';
import type { IArea } from './graphic/area';
import type { ICircle } from './graphic/circle';
import type { ILine } from './graphic/line';
import type { IPath } from './graphic/path';
import type { ISymbol } from './graphic/symbol';
import type { IText } from './graphic/text';
export interface IAllocate<T> {
    allocate: (...d: any) => T;
    getCommon?: () => T;
    allocateByObj: (obj: T) => T;
    free: (d: T) => void;
    length: number;
}
export type ICanvasAllocate = IAllocate<ICanvas>;
export type IRectAllocate = IAllocate<IRect>;
export type IArcAllocate = IAllocate<IArc>;
export type IAreaAllocate = IAllocate<IArea>;
export type ICircleAllocate = IAllocate<ICircle>;
export type ILineAllocate = IAllocate<ILine>;
export type IPathAllocate = IAllocate<IPath>;
export type ISymbolAllocate = IAllocate<ISymbol>;
export type ITextAllocate = IAllocate<IText>;
export type IMatrixAllocate = IAllocate<IMatrix>;
export type IMat4Allocate = IAllocate<mat4>;
