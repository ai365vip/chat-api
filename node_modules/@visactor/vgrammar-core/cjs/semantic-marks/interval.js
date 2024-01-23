"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerIntervalMark = exports.Interval = void 0;

const vscale_1 = require("@visactor/vscale"), enums_1 = require("../graph/enums"), encode_1 = require("../graph/mark/encode"), mark_1 = require("../parse/mark"), util_1 = require("../parse/util"), mark_2 = require("../view/mark"), vutils_1 = require("@visactor/vutils"), graphic_1 = require("../graph/util/graphic"), transform_1 = require("../graph/attributes/transform"), factory_1 = require("../core/factory");

class Interval extends mark_2.Mark {
    encodeState(state, channel, value) {
        return super.encodeState(state, channel, value), this._updateComponentEncoders(state), 
        this;
    }
    _updateComponentEncoders(state) {
        this._encoders || (this._encoders = {});
        const userEncoder = this.spec.encode[state];
        if (userEncoder && "update" === state) {
            const params = this.parameters(), scales = (0, util_1.isFunctionType)(userEncoder) ? null : Object.keys(userEncoder).reduce(((res, channel) => ((0, 
            mark_1.isScaleEncode)(userEncoder[channel]) && (res[channel] = (0, util_1.getGrammarOutput)(userEncoder[channel].scale, params)), 
            res)), {});
            this._encoders[state] = {
                callback: (datum, element, parameters) => {
                    var _a, _b, _c;
                    const userEncodeRes = (0, encode_1.invokeEncoder)(userEncoder, datum, element, parameters);
                    if (this.disableCoordinateTransform = !1, scales && scales.x && scales.x.type === vscale_1.ScaleEnum.Band) {
                        if (!(0, vutils_1.isNil)(scales.y)) {
                            const domain = scales.y.domain(), min = (0, vutils_1.minInArray)(domain), max = (0, 
                            vutils_1.maxInArray)(domain), baseValue = min > 0 ? min : max < 0 ? max : 0;
                            userEncodeRes.y1 = scales.y.scale(baseValue);
                        }
                        const bandWidth = scales.x.bandwidth();
                        userEncodeRes.x = userEncodeRes.x + bandWidth / 4, userEncodeRes.x1 = userEncodeRes.x + bandWidth / 2;
                    } else if (scales && scales.y && scales.y.type === vscale_1.ScaleEnum.Band) {
                        if (!(0, vutils_1.isNil)(scales.x)) {
                            const domain = scales.x.domain(), min = (0, vutils_1.minInArray)(domain), max = (0, 
                            vutils_1.maxInArray)(domain), baseValue = min > 0 ? min : max < 0 ? max : 0;
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
        } ] : transform_1.transformsByType.rect;
    }
    addGraphicItem(attrs, groupKey) {
        const graphicItem = (0, graphic_1.createGraphicItem)(this, this.coord && "polar" === this.coord.output().type ? enums_1.GrammarMarkType.arc : enums_1.GrammarMarkType.rect, attrs);
        return super.addGraphicItem(attrs, groupKey, graphicItem);
    }
    release() {
        super.release(), this._encoders = null;
    }
}

exports.Interval = Interval, Interval.markType = enums_1.GrammarMarkType.interval;

const registerIntervalMark = () => {
    factory_1.Factory.registerMark(enums_1.GrammarMarkType.interval, Interval);
};

exports.registerIntervalMark = registerIntervalMark;
//# sourceMappingURL=interval.js.map
