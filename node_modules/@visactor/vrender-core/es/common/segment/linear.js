import { genCurveSegments, genSegContext } from "./common";

export class Linear {
    constructor(context, startPoint) {
        this.context = context, startPoint && (this.startPoint = startPoint);
    }
    areaStart() {
        this._line = 0;
    }
    areaEnd() {
        this._line = NaN;
    }
    lineStart() {
        this._point = 0, this.startPoint && this.point(this.startPoint);
    }
    lineEnd() {
        (this._line || 0 !== this._line && 1 === this._point) && this.context.closePath(), 
        this._line = 1 - this._line;
    }
    point(p) {
        const x = p.x, y = p.y;
        switch (this._point) {
          case 0:
            this._point = 1, this._line ? this.context.lineTo(x, y, !1 !== this._lastDefined && !1 !== p.defined, p) : this.context.moveTo(x, y, p);
            break;

          case 1:
            this._point = 2;

          default:
            this.context.lineTo(x, y, !1 !== this._lastDefined && !1 !== p.defined, p);
        }
        this._lastDefined = p.defined;
    }
    tryUpdateLength() {
        return this.context.tryUpdateLength();
    }
}

export function genLinearSegments(points, params = {}) {
    const {direction: direction, startPoint: startPoint} = params;
    if (points.length < 2 - Number(!!startPoint)) return null;
    const segContext = genSegContext("linear", direction, points);
    return genLinearTypeSegments(new Linear(segContext, startPoint), points), segContext;
}

export function genLinearTypeSegments(path, points) {
    return genCurveSegments(path, points, 1);
}
//# sourceMappingURL=linear.js.map
