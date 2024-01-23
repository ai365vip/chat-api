"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ScaleComponent = void 0;

const vutils_1 = require("@visactor/vutils"), component_1 = require("../view/component");

class ScaleComponent extends component_1.Component {
    parseAddition(spec) {
        return super.parseAddition(spec), this.scale(spec.scale), this;
    }
    scale(scale) {
        if (this.spec.scale) {
            const lastScaleGrammar = (0, vutils_1.isString)(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale;
            this.detach(lastScaleGrammar), this.spec.scale = void 0;
        }
        const scaleGrammar = (0, vutils_1.isString)(scale) ? this.view.getScaleById(scale) : scale;
        return this.spec.scale = scaleGrammar, this.attach(scaleGrammar), this._updateComponentEncoders(), 
        this.commit(), this;
    }
    getScale() {
        return (0, vutils_1.isString)(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale;
    }
}

exports.ScaleComponent = ScaleComponent;
//# sourceMappingURL=scale.js.map