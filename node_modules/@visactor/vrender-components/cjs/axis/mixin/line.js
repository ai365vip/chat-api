"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LineAxisMixin = void 0;

const util_1 = require("../../util");

class LineAxisMixin {
    isInValidValue(value) {
        return value < 0 || value > 1;
    }
    getTickCoord(tickValue) {
        const {start: start} = this.attribute, axisVector = this.getRelativeVector();
        return {
            x: start.x + axisVector[0] * tickValue,
            y: start.y + axisVector[1] * tickValue
        };
    }
    getRelativeVector(point) {
        const {start: start, end: end} = this.attribute;
        return [ end.x - start.x, end.y - start.y ];
    }
    getVerticalVector(offset, inside = !1, point) {
        const {verticalFactor: verticalFactor = 1} = this.attribute, axisVector = this.getRelativeVector(), normalizedAxisVector = (0, 
        util_1.normalize)(axisVector), verticalVector = [ normalizedAxisVector[1], -1 * normalizedAxisVector[0] ];
        return (0, util_1.scale)(verticalVector, offset * (inside ? 1 : -1) * verticalFactor);
    }
}

exports.LineAxisMixin = LineAxisMixin;
//# sourceMappingURL=line.js.map
