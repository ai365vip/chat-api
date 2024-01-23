import type { IAABBBounds } from '@visactor/vutils';
import type { Releaseable, IAllocate } from '../interface';
export declare const BoundsAllocate: unique symbol;
export declare class DefaultBoundsAllocate implements IAllocate<IAABBBounds>, Releaseable {
    protected pools: IAABBBounds[];
    constructor();
    allocate(x1: number, y1: number, x2: number, y2: number): IAABBBounds;
    allocateByObj(b: IAABBBounds): IAABBBounds;
    free(b: IAABBBounds): void;
    get length(): number;
    release(...params: any): void;
}
export declare const boundsAllocate: DefaultBoundsAllocate;
