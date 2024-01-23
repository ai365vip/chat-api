import { isArray } from "@visactor/vutils";

import { isValidNumber, isNil } from "@visactor/vutils";

import { Coordinate } from "./base";

export class CartesianCoordinate extends Coordinate {
    constructor() {
        super(...arguments), this.type = "cartesian";
    }
    convert(point) {
        var _a, _b;
        if (isValidNumber(point.x1) || isValidNumber(point.y1)) {
            const convertedPoint = this.convertPoint(point), convertedPoint1 = this.convertPoint({
                x: null !== (_a = point.x1) && void 0 !== _a ? _a : point.x,
                y: null !== (_b = point.y1) && void 0 !== _b ? _b : point.y
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
            return invertedPoint.x1 = invertedPoint1.x, invertedPoint.y1 = invertedPoint1.y, 
            invertedPoint;
        }
        return this.invertPoint(point);
    }
    getRangeByDimension(dim, isSubshaft, reversed) {
        const start = this.start(), end = this.end(), res = this.isMainDimension(dim) ? [ start.x, end.x ] : [ end.y, start.y ];
        return reversed ? [ res[1], res[0] ] : res;
    }
    getVisualPositionByDimension(dim, isSubshaft, reversed) {
        return this.isMainDimension(dim) ? isSubshaft ? "top" : "bottom" : isSubshaft ? "right" : "left";
    }
    getAxisPointsByDimension(dim, isSubshaft, reversed, baseValue) {
        const start = this.start(), end = this.end();
        if (this.isMainDimension(dim)) {
            const res = isNil(baseValue) ? isSubshaft ? [ {
                x: start.x,
                y: start.y
            }, {
                x: end.x,
                y: start.y
            } ] : [ {
                x: start.x,
                y: end.y
            }, {
                x: end.x,
                y: end.y
            } ] : [ {
                x: start.x,
                y: baseValue
            }, {
                x: end.x,
                y: baseValue
            } ];
            return reversed ? [ res[1], res[0] ] : res;
        }
        const res = isNil(baseValue) ? isSubshaft ? [ {
            x: end.x,
            y: end.y
        }, {
            x: end.x,
            y: start.y
        } ] : [ {
            x: start.x,
            y: end.y
        }, {
            x: start.x,
            y: start.y
        } ] : [ {
            x: baseValue,
            y: end.y
        }, {
            x: baseValue,
            y: start.y
        } ];
        return reversed ? [ res[1], res[0] ] : res;
    }
    convertPoint(point) {
        const originPoint = isArray(point) ? {
            x: point[0],
            y: point[1]
        } : point, transformedPoint = Object.assign({}, originPoint);
        return this.convertMatrix.transformPoint(originPoint, transformedPoint), transformedPoint;
    }
    invertPoint(point) {
        const untransformedPoint = Object.assign({}, point);
        return this.invertMatrix.transformPoint(point, untransformedPoint), untransformedPoint;
    }
}
//# sourceMappingURL=cartesian.js.map