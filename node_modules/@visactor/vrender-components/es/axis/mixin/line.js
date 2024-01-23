import { normalize, scale } from "../../util";

export class LineAxisMixin {
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
        const {verticalFactor: verticalFactor = 1} = this.attribute, axisVector = this.getRelativeVector(), normalizedAxisVector = normalize(axisVector), verticalVector = [ normalizedAxisVector[1], -1 * normalizedAxisVector[0] ];
        return scale(verticalVector, offset * (inside ? 1 : -1) * verticalFactor);
    }
}
//# sourceMappingURL=line.js.map
