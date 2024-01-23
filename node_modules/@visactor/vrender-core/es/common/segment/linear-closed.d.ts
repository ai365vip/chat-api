import type { IPointLike } from '@visactor/vutils';
import type { IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';
import { Linear } from './linear';
export declare class LinearClosed extends Linear implements ILinearSegment {
    context: ISegPath2D;
    protected startPoint?: IPointLike;
    lineEnd(): void;
}
export declare function genLinearClosedSegments(points: IPointLike[], params?: IGenSegmentParams): ISegPath2D | null;
export declare function genLinearClosedTypeSegments(path: ILinearSegment, points: IPointLike[]): void;
