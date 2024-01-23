import { genLinearSegments } from "./linear";

import { genCurveSegments, genSegContext } from "./common";

function sign(x) {
    return x < 0 ? -1 : 1;
}

function slope3(curveClass, x2, y2) {
    const h0 = curveClass._x1 - curveClass._x0, h1 = x2 - curveClass._x1, s0 = (curveClass._y1 - curveClass._y0) / (h0 || Number(h1 < 0 && -0)), s1 = (y2 - curveClass._y1) / (h1 || Number(h0 < 0 && -0)), p = (s0 * h1 + s1 * h0) / (h0 + h1);
    return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), .5 * Math.abs(p)) || 0;
}

function slope2(curveClass, t) {
    const h = curveClass._x1 - curveClass._x0;
    return h ? (3 * (curveClass._y1 - curveClass._y0) / h - t) / 2 : t;
}

function point(curveClass, t0, t1, defined, p) {
    const x0 = curveClass._x0, y0 = curveClass._y0, x1 = curveClass._x1, y1 = curveClass._y1, dx = (x1 - x0) / 3;
    curveClass.context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1, defined, curveClass.lastPoint1);
}

export class MonotoneX {
    constructor(context, startPoint) {
        this.context = context, this.startPoint = startPoint;
    }
    areaStart() {
        this._line = 0;
    }
    areaEnd() {
        this._line = NaN;
    }
    lineStart() {
        this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0, this.startPoint && this.point(this.startPoint);
    }
    lineEnd() {
        switch (this._point) {
          case 2:
            this.context.lineTo(this._x1, this._y1, !1 !== this._lastDefined1 && !1 !== this._lastDefined2, this.lastPoint1);
            break;

          case 3:
            point(this, this._t0, slope2(this, this._t0), !1 !== this._lastDefined1 && !1 !== this._lastDefined2, this.lastPoint1);
        }
        (this._line || 0 !== this._line && 1 === this._point) && this.context.closePath(), 
        this._line = 1 - this._line;
    }
    point(p) {
        let t1 = NaN;
        const x = p.x, y = p.y;
        switch (this._point) {
          case 0:
            this._point = 1, this._line ? this.context.lineTo(x, y, !1 !== this._lastDefined1 && !1 !== this._lastDefined2, p) : this.context.moveTo(x, y, p);
            break;

          case 1:
            this._point = 2;
            break;

          case 2:
            this._point = 3, point(this, slope2(this, t1 = slope3(this, x, y)), t1, !1 !== this._lastDefined1 && !1 !== this._lastDefined2, p);
            break;

          default:
            point(this, this._t0, t1 = slope3(this, x, y), !1 !== this._lastDefined1 && !1 !== this._lastDefined2, p);
        }
        this._x0 = this._x1, this._x1 = x, this._y0 = this._y1, this._y1 = y, this._t0 = t1, 
        this._lastDefined1 = this._lastDefined2, this._lastDefined2 = !1 !== p.defined, 
        this.lastPoint0 = this.lastPoint1, this.lastPoint1 = p;
    }
    tryUpdateLength() {
        return this.context.tryUpdateLength();
    }
}

export class MonotoneY extends MonotoneX {
    constructor(context, startPoint) {
        super(context, startPoint);
    }
    point(p) {
        return super.point({
            y: p.x,
            x: p.y,
            defined: p.defined
        });
    }
}

export function genMonotoneXTypeSegments(path, points) {
    return genCurveSegments(path, points, 2);
}

export function genMonotoneXSegments(points, params = {}) {
    const {direction: direction, startPoint: startPoint} = params;
    if (points.length < 2 - Number(!!startPoint)) return null;
    if (points.length < 3 - Number(!!startPoint)) return genLinearSegments(points, params);
    const segContext = genSegContext("monotoneX", direction, points);
    return genMonotoneXTypeSegments(new MonotoneX(segContext, startPoint), points), 
    segContext;
}

export function genMonotoneYTypeSegments(path, points) {
    return genCurveSegments(path, points, 2);
}

export function genMonotoneYSegments(points, params = {}) {
    const {direction: direction, startPoint: startPoint} = params;
    if (points.length < 2 - Number(!!startPoint)) return null;
    if (points.length < 3 - Number(!!startPoint)) return genLinearSegments(points, params);
    const segContext = genSegContext("monotoneY", direction, points);
    return genMonotoneYTypeSegments(new MonotoneY(segContext, startPoint), points), 
    segContext;
}
//# sourceMappingURL=monotone.js.map
