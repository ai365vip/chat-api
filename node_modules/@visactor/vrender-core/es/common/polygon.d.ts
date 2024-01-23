import type { IPointLike } from '@visactor/vutils';
import type { IPath2D } from '../interface';
export declare function drawPolygon(path: IPath2D, points: IPointLike[], x: number, y: number): void;
export declare function drawRoundedPolygon(path: IPath2D, points: IPointLike[], x: number, y: number, cornerRadius: number | number[], closePath?: boolean): void;
