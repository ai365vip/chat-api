"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.boundsAllocate = exports.DefaultBoundsAllocate = exports.BoundsAllocate = void 0;

const vutils_1 = require("@visactor/vutils");

exports.BoundsAllocate = Symbol.for("BoundsAllocate");

class DefaultBoundsAllocate {
    constructor() {
        this.pools = [];
        for (let i = 0; i < 10; i++) this.pools.push(new vutils_1.AABBBounds);
    }
    allocate(x1, y1, x2, y2) {
        if (!this.pools.length) return (new vutils_1.AABBBounds).setValue(x1, y1, x2, y2);
        const b = this.pools.pop();
        return b.x1 = x1, b.y1 = y1, b.x2 = x2, b.y2 = y2, b;
    }
    allocateByObj(b) {
        if (!this.pools.length) return new vutils_1.AABBBounds(b);
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

exports.DefaultBoundsAllocate = DefaultBoundsAllocate, exports.boundsAllocate = new DefaultBoundsAllocate;
//# sourceMappingURL=bounds-allocate.js.map