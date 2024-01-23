import { type IPointLike } from '@visactor/vutils';
import type { ILinearSegment } from '../../interface/curve';
import type { ICurveType, IDirection } from '../../interface';
import { SegContext } from '../seg-context';
export declare function genCurveSegments(path: ILinearSegment, points: IPointLike[], step?: number): void;
export declare function genSegContext(curveType: ICurveType, direction: IDirection, points: IPointLike[]): SegContext;
