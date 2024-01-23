"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ColorOrdinalScale = void 0;

const vscale_1 = require("@visactor/vscale"), util_1 = require("../theme/color-scheme/util");

class ColorOrdinalScale extends vscale_1.OrdinalScale {
    range(value) {
        return value ? (this._range = value, this._resetRange(), this) : super.range();
    }
    domain(value) {
        return value ? (super.domain(value), this._resetRange(), this) : super.domain();
    }
    _resetRange() {
        if (!(0, util_1.isProgressiveDataColorScheme)(this._range)) return void super.range(this._range);
        const range = (0, util_1.computeActualDataScheme)(this._range, this._domain);
        super.range(range);
    }
}

exports.ColorOrdinalScale = ColorOrdinalScale;
//# sourceMappingURL=color-ordinal-scale.js.map
