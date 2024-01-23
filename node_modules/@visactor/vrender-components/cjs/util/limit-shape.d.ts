import type { IGraphic } from '@visactor/vrender-core';
import type { IBoundsLike } from '@visactor/vutils';
export declare function computeOffsetForlimit(shape: IGraphic, bounds: IBoundsLike): {
    dx: number;
    dy: number;
};
export declare function limitShapeInBounds(shape: IGraphic, bounds: IBoundsLike): void;
