import { genLinearSegments } from "./linear";

import { genCurveSegments, genSegContext } from "./common";

export function point(curveClass, x, y, defined, p) {
    curveClass.context.bezierCurveTo((2 * curveClass._x0 + curveClass._x1) / 3, (2 * curveClass._y0 + curveClass._y1) / 3, (curveClass._x0 + 2 * curveClass._x1) / 3, (curveClass._y0 + 2 * curveClass._y1) / 3, (curveClass._x0 + 4 * curveClass._x1 + x) / 6, (curveClass._y0 + 4 * curveClass._y1 + y) / 6, defined, curveClass.lastPoint1);
}

export class Basis {
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
        this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0, this.startPoint && this.point(this.startPoint);
    }
    lineEnd() {
        if (2 === this._point) point(this, 6 * this._x1 - (this._x0 + 4 * this._x1), 6 * this._y1 - (this._y0 + 4 * this._y1), !1 !== this._lastDefined1 && !1 !== this._lastDefined2, this.lastPoint1);
        (this._line || 0 !== this._line && 1 === this._point) && this.context.closePath(), 
        this._line = 1 - this._line;
    }
    point(p) {
        const x = p.x, y = p.y;
        switch (this._point) {
          case 0:
            this._point = 1, this._line ? this.context.lineTo(x, y, !1 !== this._lastDefined1 && !1 !== this._lastDefined2, p) : this.context.moveTo(x, y, p);
            break;

          case 1:
            this._point = 2;
            break;

          default:
            point(this, x, y, !1 !== this._lastDefined1 && !1 !== this._lastDefined2, p);
        }
        this._x0 = this._x1, this._x1 = x, this._y0 = this._y1, this._y1 = y, this._lastDefined1 = this._lastDefined2, 
        this._lastDefined2 = p.defined, this.lastPoint0 = this.lastPoint1, this.lastPoint1 = p;
    }
    tryUpdateLength() {
        return this.context.tryUpdateLength();
    }
}

export function genBasisTypeSegments(path, points) {
    return genCurveSegments(path, points, 2);
}

export function genBasisSegments(points, params = {}) {
    const {direction: direction, startPoint: startPoint} = params;
    if (points.length < 2 - Number(!!startPoint)) return null;
    if (points.length < 3 - Number(!!startPoint)) return genLinearSegments(points, params);
    const segContext = genSegContext("basis", direction, points);
    return genBasisTypeSegments(new Basis(segContext, startPoint), points), segContext;
}
//# sourceMappingURL=basis.js.map
