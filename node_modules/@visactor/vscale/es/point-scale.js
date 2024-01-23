import { ScaleEnum } from "./type";

import { BandScale } from "./band-scale";

export class PointScale extends BandScale {
    constructor(slience) {
        super(!1), this.type = ScaleEnum.Point, this._padding = 0, this.paddingInner(1, slience), 
        this.padding = this.paddingOuter, this.paddingInner = void 0, this.paddingOuter = void 0;
    }
}
//# sourceMappingURL=point-scale.js.map