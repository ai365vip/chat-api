"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerCellMark = exports.Cell = void 0;

const enums_1 = require("../graph/enums"), encode_1 = require("../graph/mark/encode"), mark_1 = require("../parse/mark"), util_1 = require("../parse/util"), mark_2 = require("../view/mark"), vutils_1 = require("@visactor/vutils"), transform_1 = require("../graph/attributes/transform"), scale_1 = require("../util/scale"), factory_1 = require("../core/factory");

class Cell extends mark_2.Mark {
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
                    const userEncodeRes = (0, encode_1.invokeEncoder)(userEncoder, datum, element, parameters);
                    if ((0, vutils_1.isNil)(userEncodeRes.size)) {
                        const sizeX = scales.x ? (0, scale_1.getBandWidthOfScale)(scales.x) : void 0, sizeY = scales.y ? (0, 
                        scale_1.getBandWidthOfScale)(scales.y) : void 0;
                        (0, vutils_1.isNil)(sizeX) && (0, vutils_1.isNil)(sizeY) ? userEncodeRes.size = 10 : (0, 
                        vutils_1.isNil)(sizeX) ? userEncodeRes.size = sizeY : (0, vutils_1.isNil)(sizeY) && (userEncodeRes.size = sizeX), 
                        userEncodeRes.size = [ sizeX, sizeY ];
                    }
                    return (0, vutils_1.isNil)(userEncodeRes.shape) && (userEncodeRes.shape = "rect"), 
                    userEncodeRes;
                }
            };
        } else this._encoders[state] = userEncoder;
    }
    _getEncoders() {
        var _a;
        return null !== (_a = this._encoders) && void 0 !== _a ? _a : {};
    }
    getAttributeTransforms() {
        return [ {
            channels: [ "size", "padding" ],
            transform: (graphicAttributes, nextAttrs, storedAttrs) => {
                if ((0, vutils_1.isNumber)(storedAttrs.padding) && storedAttrs.padding > 0) graphicAttributes.size = (0, 
                vutils_1.isArray)(storedAttrs.size) ? storedAttrs.size.map((entry => Math.max(entry - storedAttrs.padding, 1))) : Math.max(storedAttrs.size - storedAttrs.padding, 1); else if ((0, 
                vutils_1.isArray)(storedAttrs.padding) && 2 === storedAttrs.padding.length) {
                    const arraySize = (0, vutils_1.isArray)(storedAttrs.size) ? storedAttrs.size : [ storedAttrs.size, storedAttrs.size ];
                    graphicAttributes.size = [ Math.max(arraySize[0] - storedAttrs.padding[0], 1), Math.max(arraySize[1] - storedAttrs.padding[1], 1) ];
                } else graphicAttributes.size = storedAttrs.size;
            },
            storedAttrs: "paddingAttrs"
        } ].concat(transform_1.transformsByType.symbol);
    }
    release() {
        super.release(), this._encoders = null;
    }
}

exports.Cell = Cell, Cell.markType = enums_1.GrammarMarkType.cell;

const registerCellMark = () => {
    factory_1.Factory.registerMark(enums_1.GrammarMarkType.cell, Cell);
};

exports.registerCellMark = registerCellMark;
//# sourceMappingURL=cell.js.map
