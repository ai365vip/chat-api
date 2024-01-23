import { abs, Point } from "@visactor/vutils";

import { Direction } from "./enums";

import { CubicBezierCurve } from "./segment/curve/cubic-bezier";

import { LineCurve } from "./segment/curve/line";

export class SegContext {
    get endX() {
        return this._lastX;
    }
    get endY() {
        return this._lastY;
    }
    constructor(curveType, direction) {
        this.init(curveType, direction);
    }
    init(curveType, direction) {
        this._lastX = this._lastY = this._startX = this._startY = 0, this.curveType = curveType, 
        this.direction = direction, this.curves = [];
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y, defined, p) {
        const curve = new CubicBezierCurve(new Point(this._lastX, this._lastY), new Point(cp1x, cp1y), new Point(cp2x, cp2y), new Point(x, y));
        curve.originP1 = this._lastOriginP, curve.originP2 = p, curve.defined = defined, 
        this.curves.push(curve), this._lastX = x, this._lastY = y, this._lastOriginP = p;
    }
    closePath() {
        if (this.curves.length < 2) return;
        const lastCurve = this.curves[this.curves.length - 1];
        this.lineTo(this._startX, this._startY, lastCurve.defined, this._startOriginP);
    }
    ellipse() {
        throw new Error("SegContext不支持调用ellipse");
    }
    lineTo(x, y, defined, p) {
        const curve = this.addLinearCurve(x, y, defined, this._lastOriginP, p);
        this.curves.push(curve), this._lastX = x, this._lastY = y, this._lastOriginP = p;
    }
    moveTo(x, y, p) {
        return this._lastX = this._startX = x, this._lastY = this._startY = y, this._lastOriginP = p, 
        this._startOriginP = p, this;
    }
    quadraticCurveTo(cpx, cpy, x, y) {
        throw new Error("SegContext不支持调用quadraticCurveTo");
    }
    clear() {
        this.curves = [], this.length = NaN;
    }
    tryUpdateLength(direction) {
        return this.getLength(direction);
    }
    addLinearCurve(x, y, defined, p1, p2) {
        const curve = new LineCurve(new Point(this._lastX, this._lastY), new Point(x, y));
        return curve.originP1 = p1, curve.originP2 = p2, curve.defined = defined, curve;
    }
    getPointAt(t) {
        throw new Error("暂未实现");
    }
    getCurveLengths() {
        return [];
    }
    getLength(direction) {
        var _a, _b;
        if (direction === Direction.COLUMN) {
            if (!this.curves.length) return 0;
            const sc = this.curves[0], ec = this.curves[this.curves.length - 1], endP = null !== (_a = ec.p3) && void 0 !== _a ? _a : ec.p1;
            return abs(sc.p0.y - endP.y);
        }
        if (direction === Direction.ROW) {
            if (!this.curves.length) return 0;
            const sc = this.curves[0], ec = this.curves[this.curves.length - 1], endP = null !== (_b = ec.p3) && void 0 !== _b ? _b : ec.p1;
            return abs(sc.p0.x - endP.x);
        }
        return Number.isFinite(this.length) || (this.length = this.curves.reduce(((l, c) => l + c.getLength()), 0)), 
        this.length;
    }
}

export class ReflectSegContext extends SegContext {
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y, defined, p) {
        return super.bezierCurveTo(cp1y, cp1x, cp2y, cp2x, y, x, defined, p);
    }
    lineTo(x, y, defined, p) {
        return super.lineTo(y, x, defined, p);
    }
    moveTo(x, y, p) {
        return super.moveTo(y, x, p);
    }
    clear() {
        return super.clear();
    }
}
//# sourceMappingURL=seg-context.js.map