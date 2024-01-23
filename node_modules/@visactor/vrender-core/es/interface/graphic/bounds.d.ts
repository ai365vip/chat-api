import type { IAABBBounds } from '@visactor/vutils';
import type { IGraphicStyle } from '../graphic';
import type { IArcAttribute } from './arc';
import type { IAreaAttribute } from './area';
import type { ICircleAttribute } from './circle';
import type { IEllipseAttribute } from './ellipse';
import type { IImageAttribute } from './image';
import type { IIsogonAttribute } from './isogon';
import type { ILineAttribute } from './line';
import type { IPathAttribute } from './path';
import type { IPolygonAttribute } from './polygon';
import type { IRectAttribute } from './rect';
import type { IRichTextAttribute } from './richText';
import type { ISvgAttribute } from './svg';
import type { ISymbolAttribute } from './symbol';
import type { ITextAttribute } from './text';
type BoundStrokeStyle = Pick<IGraphicStyle, 'lineWidth'>;
declare enum params {
    W = 1,
    H = 2,
    WH = 3
}
export declare function arcAABB(shape: Partial<IArcAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function areaAABB(shape: Partial<IAreaAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function circleAABB(shape: Partial<ICircleAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function ellipseAABB(shape: Partial<IEllipseAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function imageAABB(shape: Partial<IImageAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function isogonAABB(shape: Partial<IIsogonAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function lineAABB(shape: Partial<ILineAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function pathAABB(shape: Partial<IPathAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function plygonAABB(shape: Partial<IPolygonAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function rectAABB(shape: Partial<IRectAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function richTextAABB(shape: Partial<IRichTextAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function svgAABB(shape: Partial<ISvgAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function symbolAABB(shape: Partial<ISymbolAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export declare function textAABB(shape: Partial<ITextAttribute & BoundStrokeStyle>, wh?: params): IAABBBounds | number;
export {};
