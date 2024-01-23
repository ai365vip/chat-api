import type { IPoint } from '@visactor/vutils';
import type { ICurve, IPath2D } from '../interface';
export declare function drawSegItem(ctx: IPath2D, curve: ICurve<IPoint>, endPercent: number, params?: {
    startLenPercent?: number;
    endLenPercent?: number;
    start?: number;
    offsetX?: number;
    offsetY?: number;
    offsetZ?: number;
}): void;
