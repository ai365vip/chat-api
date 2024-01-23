import { clampRadian, isNumberClose, isValidNumber, isNil, polarToCartesian, isArray, minInArray, maxInArray } from "@visactor/vutils";

import { Coordinate } from "./base";

export class PolarCoordinate extends Coordinate {
    constructor() {
        super(...arguments), this.type = "polar", this._isUserOrigin = !1, this._isUserRadius = !1, 
        this.startAngle = 0, this.endAngle = 2 * Math.PI, this.innerRadius = 0, this.outerRadius = 0;
    }
    _updateStartEndPoint() {
        const origin = this.origin(), minAngle = Math.min(this.startAngle, this.endAngle), maxAngle = Math.max(this.startAngle, this.endAngle), init0 = 2 * minAngle / Math.PI, init1 = 2 * maxAngle / Math.PI, angles = [ minAngle, maxAngle ];
        let i = Math.ceil(init0);
        for (;i <= init1; ) angles.push(i * Math.PI / 2), i++;
        const len = angles.length, xs = [], ys = [];
        for (i = 0; i < len; i++) {
            const p0 = polarToCartesian(origin, this.innerRadius, angles[i]), p1 = polarToCartesian(origin, this.outerRadius, angles[i]);
            xs.push(p0.x), xs.push(p1.x), ys.push(p0.y), ys.push(p1.y);
        }
        const minX = minInArray(xs), minY = minInArray(ys), maxX = maxInArray(xs), maxY = maxInArray(ys);
        this.startPoint = {
            x: minX,
            y: minY
        }, this.endPoint = {
            x: maxX,
            y: maxY
        };
    }
    _updateSize() {
        super._updateSize(), this._isUserOrigin || (this.originPoint = {
            x: this.width / 2,
            y: this.height / 2
        }, this._invokeTransforms()), this._isUserRadius || (this.outerRadius = Math.min(Math.abs(this.startPoint.x - this.originPoint.x), Math.abs(this.endPoint.x - this.originPoint.x), Math.abs(this.startPoint.y - this.originPoint.y), Math.abs(this.endPoint.y - this.originPoint.y)));
    }
    angle(angle, endAngle) {
        return isNil(angle) ? [ this.startAngle, this.endAngle ] : (Array.isArray(angle) ? (this.startAngle = angle[0], 
        this.endAngle = angle[1]) : (this.startAngle = angle, this.endAngle = null != endAngle ? endAngle : angle), 
        this._updateStartEndPoint(), this);
    }
    radius(radius, outerRadius) {
        return isNil(radius) ? [ this.innerRadius, this.outerRadius ] : (this._isUserRadius = !0, 
        Array.isArray(radius) ? (this.innerRadius = Math.min(radius[0], radius[1]), this.outerRadius = Math.max(radius[1], radius[1])) : (this.innerRadius = Math.min(radius, outerRadius), 
        this.outerRadius = Math.max(radius, outerRadius)), this._updateStartEndPoint(), 
        this);
    }
    origin(x, y) {
        return isNil(x) ? this.originPoint : (this._isUserOrigin = !0, this.originPoint = this._parsePoint(x, y), 
        this._updateStartEndPoint(), this._invokeTransforms(), this);
    }
    convert(point) {
        var _a, _b, _c, _d;
        if (isValidNumber(point.r1) || isValidNumber(point.theta1)) {
            const convertedPoint = this.convertPoint(point), convertedPoint1 = this.convertPoint({
                r: null !== (_a = point.r1) && void 0 !== _a ? _a : point.r,
                theta: null !== (_b = point.theta1) && void 0 !== _b ? _b : point.theta
            });
            return convertedPoint.x1 = convertedPoint1.x, convertedPoint.y1 = convertedPoint1.y, 
            convertedPoint;
        }
        if (isValidNumber(point.x1) || isValidNumber(point.y1)) {
            const convertedPoint = this.convertPoint(point), convertedPoint1 = this.convertPoint({
                x: null !== (_c = point.x1) && void 0 !== _c ? _c : point.x,
                y: null !== (_d = point.y1) && void 0 !== _d ? _d : point.y
            });
            return convertedPoint.x1 = convertedPoint1.x, convertedPoint.y1 = convertedPoint1.y, 
            convertedPoint;
        }
        return this.convertPoint(point);
    }
    invert(point) {
        var _a, _b;
        if (isValidNumber(point.x1) || isValidNumber(point.y1)) {
            const invertedPoint = this.invertPoint(point), invertedPoint1 = this.invertPoint({
                x: null !== (_a = point.x1) && void 0 !== _a ? _a : point.x,
                y: null !== (_b = point.y1) && void 0 !== _b ? _b : point.y
            });
            return invertedPoint.r1 = invertedPoint1.r, invertedPoint.theta1 = invertedPoint1.theta, 
            invertedPoint;
        }
        return this.invertPoint(point);
    }
    getRangeByDimension(dim, isSubshaft, reversed) {
        const res = this.isMainDimension(dim) ? [ this.startAngle, this.endAngle ] : [ this.innerRadius, this.outerRadius ];
        return reversed ? [ res[1], res[0] ] : res;
    }
    getVisualPositionByDimension(dim, isSubshaft, reversed) {
        return this.isMainDimension(dim) ? isSubshaft ? "inside" : "outside" : isSubshaft ? "end" : "start";
    }
    getAxisPointsByDimension(dim, isSubshaft, reversed, baseValue) {
        if (!this.isMainDimension(dim)) {
            const origin = this.origin(), res = isNil(baseValue) ? isSubshaft ? [ polarToCartesian(origin, this.innerRadius, this.endAngle), polarToCartesian(origin, this.outerRadius, this.endAngle) ] : [ polarToCartesian(origin, this.innerRadius, this.startAngle), polarToCartesian(origin, this.outerRadius, this.startAngle) ] : [ polarToCartesian(origin, this.innerRadius, baseValue), polarToCartesian(origin, this.outerRadius, baseValue) ];
            return reversed ? [ res[1], res[0] ] : res;
        }
        return null;
    }
    convertPoint(point) {
        const isTransposed = this.isTransposed();
        let theta, r;
        isNil(point.r) || isNil(point.theta) ? isArray(point) ? (theta = isTransposed ? point[0] : point[1], 
        r = isTransposed ? point[1] : point[0]) : (theta = isTransposed ? point.y : point.x, 
        r = isTransposed ? point.x : point.y) : (theta = isTransposed ? point.r : point.theta, 
        r = isTransposed ? point.theta : point.r);
        const convertedPoint = {
            x: Math.cos(theta) * r,
            y: Math.sin(theta) * r
        };
        !1 === point.defined && (convertedPoint.defined = !1);
        const transformedPoint = Object.assign({}, convertedPoint);
        return this.convertMatrix.transformPoint(convertedPoint, transformedPoint), transformedPoint;
    }
    invertPoint(point) {
        const untransformedPoint = Object.assign({}, point);
        this.invertMatrix.transformPoint(point, untransformedPoint);
        const cos = untransformedPoint.x, sin = untransformedPoint.y;
        if (isNumberClose(cos, 0) && isNumberClose(sin, 0)) {
            const invertedPoint = {
                r: 0,
                theta: 0
            };
            return !1 === untransformedPoint.defined && (invertedPoint.defined = !1), invertedPoint;
        }
        let theta = Math.atan(sin / cos);
        theta += cos >= 0 ? 2 * Math.PI : Math.PI, theta >= 2 * Math.PI && (theta -= 2 * Math.PI), 
        theta = clampRadian(theta);
        const radius = isNumberClose(sin, 0) ? cos / Math.cos(theta) : sin / Math.sin(theta), invertedPoint = this.isTransposed() ? {
            r: theta,
            theta: radius
        } : {
            r: radius,
            theta: theta
        };
        return !1 === untransformedPoint.defined && (invertedPoint.defined = !1), invertedPoint;
    }
}
//# sourceMappingURL=polar.js.map