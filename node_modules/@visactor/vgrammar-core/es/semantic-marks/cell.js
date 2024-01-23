import { GrammarMarkType } from "../graph/enums";

import { invokeEncoder } from "../graph/mark/encode";

import { isScaleEncode } from "../parse/mark";

import { getGrammarOutput, isFunctionType } from "../parse/util";

import { Mark } from "../view/mark";

import { isArray, isNil, isNumber } from "@visactor/vutils";

import { transformsByType } from "../graph/attributes/transform";

import { getBandWidthOfScale } from "../util/scale";

import { Factory } from "../core/factory";

export class Cell extends Mark {
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
                    const userEncodeRes = invokeEncoder(userEncoder, datum, element, parameters);
                    if (isNil(userEncodeRes.size)) {
                        const sizeX = scales.x ? getBandWidthOfScale(scales.x) : void 0, sizeY = scales.y ? getBandWidthOfScale(scales.y) : void 0;
                        isNil(sizeX) && isNil(sizeY) ? userEncodeRes.size = 10 : isNil(sizeX) ? userEncodeRes.size = sizeY : isNil(sizeY) && (userEncodeRes.size = sizeX), 
                        userEncodeRes.size = [ sizeX, sizeY ];
                    }
                    return isNil(userEncodeRes.shape) && (userEncodeRes.shape = "rect"), userEncodeRes;
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
                if (isNumber(storedAttrs.padding) && storedAttrs.padding > 0) graphicAttributes.size = isArray(storedAttrs.size) ? storedAttrs.size.map((entry => Math.max(entry - storedAttrs.padding, 1))) : Math.max(storedAttrs.size - storedAttrs.padding, 1); else if (isArray(storedAttrs.padding) && 2 === storedAttrs.padding.length) {
                    const arraySize = isArray(storedAttrs.size) ? storedAttrs.size : [ storedAttrs.size, storedAttrs.size ];
                    graphicAttributes.size = [ Math.max(arraySize[0] - storedAttrs.padding[0], 1), Math.max(arraySize[1] - storedAttrs.padding[1], 1) ];
                } else graphicAttributes.size = storedAttrs.size;
            },
            storedAttrs: "paddingAttrs"
        } ].concat(transformsByType.symbol);
    }
    release() {
        super.release(), this._encoders = null;
    }
}

Cell.markType = GrammarMarkType.cell;

export const registerCellMark = () => {
    Factory.registerMark(GrammarMarkType.cell, Cell);
};
//# sourceMappingURL=cell.js.map
