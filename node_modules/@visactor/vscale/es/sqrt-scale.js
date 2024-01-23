import { sqrt, square } from "./utils/utils";

import { LinearScale } from "./linear-scale";

import { ScaleEnum } from "./type";

export class SqrtScale extends LinearScale {
    constructor() {
        super(sqrt, square), this.type = ScaleEnum.Sqrt;
    }
    clone() {
        return (new SqrtScale).domain(this._domain, !0).range(this._range, !0).unknown(this._unknown).clamp(this.clamp(), null, !0).interpolate(this._interpolate);
    }
}
//# sourceMappingURL=sqrt-scale.js.map