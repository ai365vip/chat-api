import { AABBBounds } from "@visactor/vutils";

export const BoundsAllocate = Symbol.for("BoundsAllocate");

export class DefaultBoundsAllocate {
    constructor() {
        this.pools = [];
        for (let i = 0; i < 10; i++) this.pools.push(new AABBBounds);
    }
    allocate(x1, y1, x2, y2) {
        if (!this.pools.length) return (new AABBBounds).setValue(x1, y1, x2, y2);
        const b = this.pools.pop();
        return b.x1 = x1, b.y1 = y1, b.x2 = x2, b.y2 = y2, b;
    }
    allocateByObj(b) {
        if (!this.pools.length) return new AABBBounds(b);
        const _b = this.pools.pop();
        return _b.x1 = b.x1, _b.y1 = b.y1, _b.x2 = b.x2, _b.y2 = b.y2, _b;
    }
    free(b) {
        this.pools.push(b);
    }
    get length() {
        return this.pools.length;
    }
    release(...params) {
        this.pools = [];
    }
}

export const boundsAllocate = new DefaultBoundsAllocate;
//# sourceMappingURL=bounds-allocate.js.map