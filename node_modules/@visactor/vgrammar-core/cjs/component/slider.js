"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerSlider = exports.Slider = exports.generateSliderAttributes = void 0;

const vutils_1 = require("@visactor/vutils"), vrender_components_1 = require("@visactor/vrender-components"), enums_1 = require("../graph/enums"), component_1 = require("../view/component"), encode_1 = require("../graph/mark/encode"), util_1 = require("../parse/util"), factory_1 = require("../core/factory"), slider_filter_1 = require("../interactions/slider-filter"), filter_1 = require("../interactions/filter"), generateSliderAttributes = (min, max, theme, addition) => {
    var _a;
    const sliderTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.slider;
    return (0, vutils_1.merge)({}, sliderTheme, {
        min: min,
        max: max,
        value: [ min, max ]
    }, null != addition ? addition : {});
};

exports.generateSliderAttributes = generateSliderAttributes;

class Slider extends component_1.Component {
    constructor(view, group) {
        super(view, enums_1.ComponentEnum.slider, group), this.spec.componentType = enums_1.ComponentEnum.slider;
    }
    parseAddition(spec) {
        return super.parseAddition(spec), this.min(spec.min), this.max(spec.max), this;
    }
    min(min) {
        return this.setFunctionSpec(min, "min");
    }
    max(max) {
        return this.setFunctionSpec(max, "max");
    }
    setStartEndValue(start, end) {
        return this.getGroupGraphicItem().setValue([ start, end ]), this;
    }
    _updateComponentEncoders() {
        const encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    const min = (0, vutils_1.isNil)(this.spec.min) ? 0 : (0, util_1.invokeFunctionType)(this.spec.min, parameters, datum, element), max = (0, 
                    vutils_1.isNil)(this.spec.max) ? 1 : (0, util_1.invokeFunctionType)(this.spec.max, parameters, datum, element), theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), addition = (0, 
                    encode_1.invokeEncoder)(encoder, datum, element, parameters);
                    return (0, exports.generateSliderAttributes)(min, max, theme, addition);
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
}

exports.Slider = Slider, Slider.componentType = enums_1.ComponentEnum.slider;

const registerSlider = () => {
    factory_1.Factory.registerGraphicComponent(enums_1.ComponentEnum.slider, (attrs => new vrender_components_1.Slider(attrs))), 
    factory_1.Factory.registerComponent(enums_1.ComponentEnum.slider, Slider), (0, vutils_1.mixin)(filter_1.Filter, filter_1.FilterMixin), 
    factory_1.Factory.registerInteraction(slider_filter_1.SliderFilter.type, slider_filter_1.SliderFilter);
};

exports.registerSlider = registerSlider;
//# sourceMappingURL=slider.js.map