import { ScaleEnum } from "@visactor/vscale";

import { GrammarMarkType } from "../graph/enums";

import { invokeEncoder } from "../graph/mark/encode";

import { isScaleEncode } from "../parse/mark";

import { getGrammarOutput, isFunctionType } from "../parse/util";

import { Mark } from "../view/mark";

import { isNil, maxInArray, minInArray } from "@visactor/vutils";

import { createGraphicItem } from "../graph/util/graphic";

import { transformsByType } from "../graph/attributes/transform";

import { Factory } from "../core/factory";

export class Interval extends Mark {
    encodeState(state, channel, value) {
        return super.encodeState(state, channel, value), this._updateComponentEncoders(state), 
        this;
    }
    _updateComponentEncoders(state) {
        this._encoders || (this._encoders = {});
        const userEncoder = this.spec.encode[state];
        if (userEncoder && "update" === state) {
            const params = this.parameters(), scales = isFunctionType(userEncoder) ? null : Object.keys(userEncoder).reduce(((res, channel) => (isScaleEncode(userEncoder[channel]) && (res[channel] = getGrammarOutput(userEncoder[channel].scale, params)), 
            res)), {});
            this._encoders[state] = {
                callback: (datum, element, parameters) => {
                    var _a, _b, _c;
                    const userEncodeRes = invokeEncoder(userEncoder, datum, element, parameters);
                    if (this.disableCoordinateTransform = !1, scales && scales.x && scales.x.type === ScaleEnum.Band) {
                        if (!isNil(scales.y)) {
                            const domain = scales.y.domain(), min = minInArray(domain), max = maxInArray(domain), baseValue = min > 0 ? min : max < 0 ? max : 0;
                            userEncodeRes.y1 = scales.y.scale(baseValue);
                        }
                        const bandWidth = scales.x.bandwidth();
                        userEncodeRes.x = userEncodeRes.x + bandWidth / 4, userEncodeRes.x1 = userEncodeRes.x + bandWidth / 2;
                    } else if (scales && scales.y && scales.y.type === ScaleEnum.Band) {
                        if (!isNil(scales.x)) {
                            const domain = scales.x.domain(), min = minInArray(domain), max = maxInArray(domain), baseValue = min > 0 ? min : max < 0 ? max : 0;
                            userEncodeRes.x1 = scales.x.scale(baseValue);
                        }
                        const bandWidth = scales.y.bandwidth();
                        userEncodeRes.y = userEncodeRes.y + bandWidth / 4, userEncodeRes.y1 = userEncodeRes.y + bandWidth / 2;
                    }
                    if (scales) {
                        const coord = (null !== (_b = this.view.getScaleById(null === (_a = userEncoder.x) || void 0 === _a ? void 0 : _a.scale)) && void 0 !== _b ? _b : this.view.getScaleById(null === (_c = userEncoder.y) || void 0 === _c ? void 0 : _c.scale)).getCoordinate();
                        if (coord && "polar" === coord.type) {
                            this.disableCoordinateTransform = !0;
                            const origin = coord.origin();
                            userEncodeRes.cx = origin.x, userEncodeRes.cy = origin.y;
                        }
                    }
                    return userEncodeRes;
                }
            };
        } else this._encoders[state] = userEncoder;
    }
    _getEncoders() {
        var _a;
        return null !== (_a = this._encoders) && void 0 !== _a ? _a : {};
    }
    getAttributeTransforms() {
        return this.coord && "polar" === this.coord.output().type ? [ {
            channels: [ "x", "y", "x1", "y1", "cx", "cy" ],
            transform: (graphicAttributes, nextAttrs, storedAttrs) => {
                graphicAttributes.x = storedAttrs.cx, graphicAttributes.y = storedAttrs.cy, this.coord.output().isTransposed() ? (graphicAttributes.startAngle = storedAttrs.y, 
                graphicAttributes.endAngle = storedAttrs.y1, graphicAttributes.innerRadius = storedAttrs.x, 
                graphicAttributes.outerRadius = storedAttrs.x1) : (graphicAttributes.startAngle = storedAttrs.x, 
                graphicAttributes.endAngle = storedAttrs.x1, graphicAttributes.innerRadius = storedAttrs.y, 
                graphicAttributes.outerRadius = storedAttrs.y1);
            },
            storedAttrs: "sizeAttrs"
        } ] : transformsByType.rect;
    }
    addGraphicItem(attrs, groupKey) {
        const graphicItem = createGraphicItem(this, this.coord && "polar" === this.coord.output().type ? GrammarMarkType.arc : GrammarMarkType.rect, attrs);
        return super.addGraphicItem(attrs, groupKey, graphicItem);
    }
    release() {
        super.release(), this._encoders = null;
    }
}

Interval.markType = GrammarMarkType.interval;

export const registerIntervalMark = () => {
    Factory.registerMark(GrammarMarkType.interval, Interval);
};
//# sourceMappingURL=interval.js.map
