import { OrdinalScale } from "@visactor/vscale";

import { computeActualDataScheme, isProgressiveDataColorScheme } from "../theme/color-scheme/util";

export class ColorOrdinalScale extends OrdinalScale {
    range(value) {
        return value ? (this._range = value, this._resetRange(), this) : super.range();
    }
    domain(value) {
        return value ? (super.domain(value), this._resetRange(), this) : super.domain();
    }
    _resetRange() {
        if (!isProgressiveDataColorScheme(this._range)) return void super.range(this._range);
        const range = computeActualDataScheme(this._range, this._domain);
        super.range(range);
    }
}
//# sourceMappingURL=color-ordinal-scale.js.map
