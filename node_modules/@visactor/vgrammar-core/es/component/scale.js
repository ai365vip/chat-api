import { isString } from "@visactor/vutils";

import { Component } from "../view/component";

export class ScaleComponent extends Component {
    parseAddition(spec) {
        return super.parseAddition(spec), this.scale(spec.scale), this;
    }
    scale(scale) {
        if (this.spec.scale) {
            const lastScaleGrammar = isString(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale;
            this.detach(lastScaleGrammar), this.spec.scale = void 0;
        }
        const scaleGrammar = isString(scale) ? this.view.getScaleById(scale) : scale;
        return this.spec.scale = scaleGrammar, this.attach(scaleGrammar), this._updateComponentEncoders(), 
        this.commit(), this;
    }
    getScale() {
        return isString(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale;
    }
}
//# sourceMappingURL=scale.js.map